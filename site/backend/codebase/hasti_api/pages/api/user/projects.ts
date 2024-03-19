import { UserProjectsResponse } from '@/interfaces/user/requests';
import { JWTResult, handleUserJWTPayload } from '@/pages/helpers/user';
import prisma from '@/clients/prisma/client';
import { Project, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';


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
            
            // Get count of user's repositories
            const userProject:Project[] = await prisma.project.findMany({
                where: {
                    userID: user.id
                }
            })


            const response: UserProjectsResponse = {
                success: true,
                projects: userProject
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