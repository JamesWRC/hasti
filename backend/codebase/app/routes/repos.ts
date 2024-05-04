import { Router } from 'express';
import { UserRepoCountResponse, UserReposResponse } from '@/backend/interfaces/user/request';
import type { User } from '@/backend/interfaces/user';
// import { JWTResult, handleUserJWTPayload } from '@/backend/helpers/user';
import { BadRequestResponse } from '@/backend/interfaces/request';
import prisma from '@/backend/clients/prisma/client';

import logger from '../logger';
import { Repo } from '@/backend/interfaces/repo';
import { isAuthenticated } from '@/backend/helpers/auth';

const reposRouter = Router();

reposRouter.get<Record<string, string>, UserRepoCountResponse | BadRequestResponse>(
'/:userID/count',
isAuthenticated,
async (req, res) => {
    try {
        const userID:string = req.params.userID
        const user: User | undefined = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized. No token provided 12.' });
        }

        const userRepos = await prisma.repo.count({
            where: {
                userID: userID
            }
        })

        const response: UserRepoCountResponse = {
            success: true,
            count: userRepos
        }
        
        return res.status(200).json(response);
    } catch (error) {
        logger.warn(`Request threw an exception: ${error}`, {
            label: 'GET: /projects/:userid/count: ',
            });
    return res.status(500).json({ success: false, message: 'Error getting token' });
    }
});



reposRouter.get<Record<string, string>, UserReposResponse | BadRequestResponse>(
    '/:userID',
    isAuthenticated,
    async (req, res) => {
        try {
            console.log('req:', req.params.userID)
            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }
    
            // Get count of user's repositories
            const userRepos:Repo[] = await prisma.repo.findMany({
                where: {
                    userID: user.id,
                    gitAppHasAccess: true
                }
            })


            const response: UserReposResponse = {
                success: true,
                repos: userRepos
            }
            return res.status(200).json(response);
        } catch (error) {
            logger.warn(`Request threw an exception: ${error}`, {
                label: 'GET: /projects/:userid/count: ',
                });
        return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

export default reposRouter;