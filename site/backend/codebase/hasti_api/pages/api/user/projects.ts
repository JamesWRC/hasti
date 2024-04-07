import { JWTResult, handleUserJWTPayload } from '@/pages/helpers/user';
import prisma from '@/clients/prisma/client';
import { Project, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetProjectResponse, UserProject } from '@/interfaces/project/request';
import { GetProjectsQueryParams } from '@/interfaces/user/requests';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const reqHeaders = req.headers;
            const token = reqHeaders.authorization?.replace('Bearer ', '') as string;
            const tokenResult:JWTResult<User, string> = await handleUserJWTPayload(token)

            if(!tokenResult.success){
                return res.status(401).json({ message: tokenResult.message });
            }

            const user:User = tokenResult.user

            // parse query params
            const queryParams:GetProjectsQueryParams = req.query

            const userProject:Project[] = await prisma.project.findMany({
                where: {
                    userID: user.id
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: queryParams.limit ? Number(queryParams.limit) : undefined
                
            })

            const userProjects:UserProject[] = userProject.map((project) => {
                return {
                    user: user,
                    project: project
                }
            })
            const response: GetProjectResponse = {
                success: true,
                userProjects: userProjects
            }
            
            return res.status(200).json(response);

        } catch (error) {
            
            console.error('Error getting token:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

    }else{
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
};
