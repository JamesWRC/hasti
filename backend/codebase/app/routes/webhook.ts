import { Router } from 'express';
import { UserNotificationCountResponse } from '@/backend/app/interfaces/user/request';
import type { User } from '@/backend/app/interfaces/user';
import type { Notification } from '@/backend/app/interfaces/notification';
// import { JWTResult, handleUserJWTPayload } from '@/backend/app/helpers/user';
import { BadRequestResponse, OkResponse } from '@/backend/app/interfaces/request';
import prisma from '@/backend/app/clients/prisma/client';
import { Prisma } from '@prisma/client';
import { GetNotificationsQueryParams, GetNotificationsResponse, UpdateNotificationReadStatus, UpdateNotificationReadStatusResponse } from '@/backend/app/interfaces/notification/request';
import { getAllNotificationAbout, getAllNotificationTypes } from '@/backend/app/interfaces/notification';
import logger from '../logger';
import type { SearchResponse } from '@/backend/app/interfaces/search';
import tsClient from '@/backend/app/clients/typesense';
import { GitHubAddRepoRequest } from '@/backend/app/interfaces/repo';
import verifySignature from '@/backend/app/helpers/webhook';
import addOrUpdateRepo, { removeRepo } from '@/backend/app/helpers/repo';

const webhookRouter = Router();

webhookRouter.post<Record<string, string>, OkResponse | BadRequestResponse, any>(
    '/github',
    async (req, res) => {
        try {
            // Verify the request is coming from GitHub
        const signature = req.headers['x-hub-signature'] as string;
        const event = req.headers['x-github-event'] as string;

        const payload = req.body as GitHubAddRepoRequest;
        const action = payload.action;
        console.log('signature', signature)
        console.log('event', event)
        // console.log('body', payload)

        // Verify the signature and event type
        if (verifySignature(signature, payload)) {

            const GitHubUserID = payload.installation.account.id;
            const GitHubUsername = payload.installation.account.login;
            console.log('GitHubUserID', GitHubUserID)
            const user: User|null = await prisma.user.findUnique({
                where: {
                    githubID: GitHubUserID
                }
            })
            console.log('user', user)

            if(user){
                console.log('user', user)
                if(event === 'installation_repositories'){
                    console.log('event', event)
                    console.log('action', action)
                    // Add repos
                    if(action === 'added'){
                        console.log('payload.repositoriesAdded', payload.repositories_added)

                        for (const repo of payload.repositories_added) {
                            console.log('add repo', repo)    
                            await addOrUpdateRepo(repo, user)
                        }
                    }
                    // Remove repos 
                    if(action === 'removed'){
                        for (const repo of payload.repositories_removed) {
                            console.log('del repo', repo)
                            await removeRepo(repo)
                        }
                    }
                }

            }else{
                res.status(400).json({success: false, message: 'User not found' });
            }
                 

            // Send a success response
            res.status(200).json({success: true, message: 'Webhook received successfully' });
        } else {
            // Invalid signature or event type
            res.status(400).json({success: false, message: 'Invalid webhook request' });
        }
        } catch (error) {
            logger.warn(`Request threw an exception: ${error}`, {
                label: 'GET: /projects/:userid/count: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

export default webhookRouter;