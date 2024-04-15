import prisma from '@/clients/prisma/client';
import type { ProjectWithUser } from '@/clients/prisma/client'
import { Prisma, Project, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetProjectsResponse } from '@/interfaces/project/request';
import { GetProjectsQueryParams } from '@/interfaces/project/request';
import { getAllProjectTypes } from '@/interfaces/project';


const PROJECT_MAX_TAKE = 50

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const reqHeaders = req.headers;
            const token = reqHeaders.authorization?.replace('Bearer ', '') as string;
            // const tokenResult:JWTResult<User, string> = await handleUserJWTPayload(token)

            // if(!tokenResult.success){
            //     return res.status(401).json({ message: tokenResult.message });
            // }

            let user:User | null = null;

            // parse query params
            const queryParams:GetProjectsQueryParams = req.query
            let query:Prisma.ProjectFindManyArgs = {}

            // Set the request amount to a default fo 10, and a max of 50
            let requestAmt = 10
            if(Number(queryParams.limit)){
                requestAmt = Number(queryParams.limit) > PROJECT_MAX_TAKE ? PROJECT_MAX_TAKE : Number(queryParams.limit)
            }

            let projectUserID:string|null = '';
            
            // get userID from username or githubUserID
            if(queryParams.username || queryParams.githubUserID){ 
                user = await prisma.user.findFirst({
                    where: {
                        OR : [ { username: queryParams.username },
                                { githubID: queryParams.githubUserID } ]
                        }
                    })
            }
            
            // set the userID if provided
            if(queryParams.userID){
                user = await prisma.user.findFirst({
                    where: {
                        id: queryParams.userID
                    }
                })
            }

            // validate type if provided
            if(queryParams.type){
                const validTypes = getAllProjectTypes(false)
                if(!validTypes.includes(queryParams.type)){
                    return res.status(400).json({ message: `Invalid project type specified. Type (case sensitive) must be one of: ${validTypes.join(', ')}` });
                }
            }

            // find where using specified type and userID
            if(queryParams.type && user){
                // validate type
                query.where = {
                    AND: [
                        { userID: user.id },
                        { projectType: queryParams.type }
                    ]
                }
               
            // find where using specified type
            }else if(queryParams.type){ 
                console.log('type:', queryParams.type)
                query.where = {
                    projectType: queryParams.type
                }

            // find where using specified userID
            }else if(user){
                query.where = {
                    userID: user.id
                }
            }
            
            
            // if no cursor is provided, get a limited number of rows.
            // Default limit is 1
            if(!queryParams.cursor){
                query.take = Number(requestAmt)
            }else{
                query.take = Number(requestAmt)
                query.skip = 1  // Skip the cursor row.
                query.cursor = {// set the cursor 'page'
                    id: queryParams.cursor
                }
            }

            // set order by and direction
            if(queryParams.orderBy){
                // Will order by the defined field, default is descending
                query.orderBy ={
                    [queryParams.orderBy]: queryParams.orderDirection ? queryParams.orderDirection : 'desc'
                }
            }else{
                // Default order by is createdAt, descending
                query.orderBy = {
                    createdAt: 'desc'
                }
            }


            const projects:ProjectWithUser[] = await prisma.project.findMany({...query, include: {user:true}})
            console.log('projects:', projects)
            if(projects && projects.length > 0){
                
                const response: GetProjectsResponse = {
                    success: true,
                    userProjects: projects
                }
                
                return res.status(200).json(response);
            }else{
                return res.status(404).json({ message: 'No Projects made by any user were able to be found. Please specify the proper params.' });
            }


        } catch (error) {
            
            console.error('Error getting token:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

    }else{
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
};
