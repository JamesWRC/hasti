import { Router } from 'express';
import { UserRepoCountResponse, UserReposResponse } from '@/backend/interfaces/user/request';
import type { User } from '@/backend/interfaces/user';
// import { JWTResult, handleUserJWTPayload } from '@/backend/helpers/user';
import { BadRequestResponse } from '@/backend/interfaces/request';
import prisma from '@/backend/clients/prisma/client';

import logger from '../logger';
import { Repo, RepositoryData } from '@/backend/interfaces/repo';
import { isAuthenticated } from '@/backend/helpers/auth';
import addOrUpdateRepo, { updateRepoData } from '@/backend/helpers/repo';
import { FileExistsRequest, RefreshRepoDataRequest } from '@/backend/interfaces/repo/request';
import { updateContent } from '@/backend/helpers/project';
import { constructUserOctoKitAuth } from '../helpers/auth/github';
import { getGitHubUserAuth } from '@/backend/helpers/auth/github';

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
            label: 'GET: /repos/:userid/count: ',
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
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'GET: /repos/:userid: ',
                });
        return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

// Will be used by authenticated users to manually update the repo for the project. And AUTHENTICATED users when they view their project if the repo hasnt been updated in a while.
reposRouter.put<Record<string, string>, RefreshRepoDataRequest | BadRequestResponse>(
    '/:repoID',
    isAuthenticated,
    async (req, res) => {
        try {
            const repoID:string = req.params.repoID
            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }
    
            const repo = await prisma.repo.findFirst({
                where: {
                    id: repoID
                }
            })

            if(repo){

                // Get the repo owner
                const ownerUser = await prisma.user.findFirst({
                    where: {
                        id: repo.userID
                    }
                })

                if(ownerUser){
                    // Update the repo data
                    await updateRepoData(repo, ownerUser)
                    return res.status(200).json({ success: true, message: 'Repo data updated' });
                }
            }

            return res.status(404).json({ success: false, message: 'Unknown repoID' });

        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'PUT: /:repoID ',
                });
        return res.status(500).json({ success: false, message: 'Error updating repo data' });
        }
    });


// Will be used by authenticated users to manually update the repo for the project. And AUTHENTICATED users whe they view their project if the repo hasnt been updated in a while.
reposRouter.get<Record<string, string>, FileExistsRequest | BadRequestResponse>(
    '/:repoID/hasFile',
    isAuthenticated,
    async (req, res) => {
        try {
            const repoID:string = req.params.repoID
            const filePath:string = req.query.path as string
            console.log('filePath:', filePath)

            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }
    
            const repo = await prisma.repo.findFirst({
                where: {
                    id: repoID
                }
            })

            if(repo){

                // Get the repo owner
                const ownerUser = await prisma.user.findFirst({
                    where: {
                        id: repo.userID
                    }
                })

                if(ownerUser){
                    const ghRquest = await getGitHubUserAuth(ownerUser)
                    return ghRquest.request('GET /repos/{owner}/{repo}/contents/{path}', {
                        owner: ownerUser.username,
                        repo: repo.name,
                        path: filePath
                    }).then((response) => {
                        return res.status(200).json({ success: true, message: 'File exists' });
                    }).catch((error) => {
                        return res.status(204).json({ success: false, message: 'File does not exist' });
                    })

                
                }
            }

            return res.status(404).json({ success: false, message: 'Unknown repoID' });

        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'PUT: /:repoID ',
                });
        return res.status(500).json({ success: false, message: 'Error updating repo data' });
        }
    });
export default reposRouter;