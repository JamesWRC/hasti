import prisma from '@/backend/clients/prisma/client';
import type { ProjectWithUser } from '@/backend/clients/prisma/client'
import { Prisma, Notification, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetProjectsResponse } from '@/backend/interfaces/project/request';
import { getAllProjectTypes } from '@/backend/interfaces/project';
import { handleUserJWTPayload } from '@/backend/pages_old/helpers/user';
import type { JWTResult } from '@/backend/pages_old/helpers/user'
import type { GetNotificationsQueryParams, GetNotificationsResponse, UpdateNotificationReadStatus, UpdateNotificationReadStatusResponse } from '@/backend/interfaces/notification/request';
import { getAllNotificationAbout, getAllNotificationTypes, getNotificationType } from '@/backend/interfaces/notification';


const NOTIFICATION_MAX_TAKE = 100

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const reqHeaders = req.headers;
            const token = reqHeaders.authorization?.replace('Bearer ', '') as string;
            const tokenResult:JWTResult<User, string> = await handleUserJWTPayload(token)

            const queryParams:GetNotificationsQueryParams = req.query

            let user:User|null;
            if(!tokenResult.success){
                return res.status(401).json({ message: tokenResult.message });
            }
            user = tokenResult.user

            // if(!tokenResult.success){

            //     if(queryParams.userID){
            //         userQuery.where = {
            //             id: queryParams.userID
            //         }
            //     }else if(queryParams.username){
            //         userQuery.where = {
            //             username: queryParams.username
            //         }
            //     }else if(queryParams.githubUserID){
            //         userQuery.where = {
            //             githubID: queryParams.githubUserID
            //         }
            //     }else{
            //         return res.status(404).json({ message: 'No user specified. Either specify JWT token, ' });
            //     }
            //     user = await prisma.user.findFirst()
            // }


            // parse query params
            let query:Prisma.NotificationFindManyArgs = {}

            // Set the request amount to a default fo 10, and a max of 50
            let requestAmt = 10
            if(Number(queryParams.limit)){
                requestAmt = Number(queryParams.limit) > NOTIFICATION_MAX_TAKE ? NOTIFICATION_MAX_TAKE : Number(queryParams.limit)
            }            
        

            // validate type if provided
            if(queryParams.type){
                const validTypes = getAllNotificationTypes(false)
                if(!validTypes.includes(queryParams.type)){
                    return res.status(400).json({ message: `Invalid notification type specified. Type (case sensitive) must be one of: ${validTypes.join(', ')}` });
                }
            }

            // validate about if provided
            if(queryParams.about){
                const validTypes = getAllNotificationAbout(false)
                if(!validTypes.includes(queryParams.about)){
                    return res.status(400).json({ message: `Invalid notification about specified. Type (case sensitive) must be one of: ${validTypes.join(', ')}` });
                }
            }

            // find where using specified type and userID
            if((queryParams.type && queryParams.about) && user){
                // validate type
                query.where = {
                    AND: [
                        { userID: user.id },
                        {
                          OR: [
                            { type: queryParams.type },
                            { about: queryParams.about }
                          ]
                        }
                    ]
                }
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
            // query.include = {
            //     user: true
            // }

            // const users:ProjectWithUser = await prisma.project.findMany({ include: { user: true } })
            console.log('query:', query)


            const notification:Notification[] = await prisma.notification.findMany(query)
            console.log('projects:', notification)
            if(notification.length > 0){
                
                const response: GetNotificationsResponse = {
                    success: true,
                    notifications: notification
                }
                
                return res.status(200).json(response);
            }else{
                return res.status(404).json({ message: 'No Projects made by any user were able to be found. Please specify the proper params.' });
            }


        } catch (error) {
            
            console.error('Error getting token:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

    }else if(req.method === 'PUT'){
        const reqHeaders = req.headers;
        const token = reqHeaders.authorization?.replace('Bearer ', '') as string;
        const tokenResult:JWTResult<User, string> = await handleUserJWTPayload(token)

        const reqBody:UpdateNotificationReadStatus = await req.body
        let user:User|null;
        if(!tokenResult.success){
            return res.status(401).json({ message: tokenResult.message });
        }
        user = tokenResult.user

        // batch update notifications
        if(reqBody.notificationIDs && reqBody.notificationIDs.length > 0){
            const updatedNotifications:Prisma.BatchPayload = await prisma.notification.updateMany({
                where: {
                    AND: [
                        { userID: user.id },
                        { id: { in: reqBody.notificationIDs } }
                    ]
                },
                data: {
                    read: reqBody.read
                }
            })
            const response:UpdateNotificationReadStatusResponse = {
                success: true,
                updatedCount: updatedNotifications.count,
                message: `Successfully updated ${updatedNotifications.count} notifications`
            }
            return res.status(200).json(response);
            
        }else{
            const response:UpdateNotificationReadStatusResponse = {
                success: false,
                updatedCount: 0,
                message: `Successfully updated 0 notifications`
            }
            return res.status(400).json(response);
        }


        
    }else{
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
};
