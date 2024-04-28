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
import { GHAppInstallation, GHAppSenderWHSender, GitHubRepoRequest, RepositoryData } from '@/backend/app/interfaces/repo';
import verifySignature from '@/backend/app/helpers/webhook';
import addOrUpdateRepo, { removeRepo, setGitAppHasAccess } from '@/backend/app/helpers/repo';
import { getGitHubUserToken } from '../helpers/user';
import { getGitHubUserAuth } from '../helpers/auth/github';



const webhookRouter = Router();

webhookRouter.post<Record<string, string>, OkResponse | BadRequestResponse, any>(
    '/github',
    async (req, res) => {
        try {
            // Verify the request is coming from GitHub
        const signature = req.headers['x-hub-signature'] as string;
        const event = req.headers['x-github-event'] as string;
        const deliveryUID = req.headers['x-github-delivery'] as string;

        const payload = req.body;
        const action = payload.action;
        const installation:GHAppInstallation = {
            id: payload.installation.id,
            account: {
                login: payload.installation.account.login,
                id: payload.installation.account.id,
                type: payload.installation.account.type
            }
        };
        const sender:GHAppSenderWHSender = {
            id: payload.sender.id,
            login: payload.sender.login,
            node_id: payload.sender.node_id,
            type: payload.sender.type
        };

        const gitHubRepoRequest:GitHubRepoRequest = {
            action: action,
            installation: installation,
            sender: sender,
            repositories_added: payload.repositories_added,
            repositories_removed: payload.repositories_removed
        }

        // console.log('body', payload)
        console.log('signature', signature)
        console.log('payload', payload)
        // Verify the signature and event type
        if (verifySignature(signature, payload)) {

            //See if event already been processed
            const eventExists = await prisma.webhookEvents.findFirst({
                where: {
                    AND: [
                        {
                            webhookId: deliveryUID
                        },
                        {
                            source: "github"
                        }
                    ]
                }
            })

            if(eventExists){
                return res.status(200).json({success: true, message: 'Webhook already processed' });
            }

            const GitHubUserID = gitHubRepoRequest.sender.id;
            const GitHubUsername = gitHubRepoRequest.sender.login;
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
                    const dbPromises: Promise<boolean>[] = []

                    
                      // Remove repos 
                      if(action === 'removed'){
                        for (const repo of gitHubRepoRequest.repositories_removed) {
                            const addedRemoved:RepositoryData = {
                                id: repo.id,
                                node_id: repo.node_id,
                                name: repo.name,
                                full_name: repo.full_name,
                                private: repo.private,
                            }
                            console.log('del repo', addedRemoved)
                            const hasAccess: boolean = false
                            const dbActions = setGitAppHasAccess(addedRemoved, hasAccess)
                            dbPromises.push(dbActions)
                        }
                    }

                    if(action === 'added'){
                        console.log('payload.repositoriesAdded', payload.repositories_added)

                        for (const repo of gitHubRepoRequest.repositories_added) {
                            console.log(repo)
                            const addedRepo:RepositoryData = {
                                id: repo.id,
                                node_id: repo.node_id,
                                name: repo.name,
                                full_name: repo.full_name,
                                private: repo.private,
                               
                            }
                            console.log('add repo', addedRepo)     
                            
                           const dbActions = addOrUpdateRepo(addedRepo, user, sender, installation)
                           dbPromises.push(dbActions)
                        }
                    }

                    await Promise.all(dbPromises)

                }

            }else{
                return res.status(400).json({success: false, message: 'User not found. Cannot add repository. User making request must have already signed up.' });
            }
            console.log('eventExists', deliveryUID)
            await prisma.webhookEvents.create({
                data: {
                    webhookId: deliveryUID,
                    source: "github",
                }
            })

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