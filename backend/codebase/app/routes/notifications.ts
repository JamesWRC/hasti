import { Router } from 'express';
import { UserNotificationCountResponse } from '@/backend/interfaces/user/request';
import type { User } from '@/backend/interfaces/user';
import type { Notification } from '@/backend/interfaces/notification';
// import { JWTResult, handleUserJWTPayload } from '@/backend/helpers/user';
import { BadRequestResponse } from '@/backend/interfaces/request';
import prisma from '@/backend/clients/prisma/client';
import { Prisma } from '@prisma/client';
import { GetNotificationsQueryParams, GetNotificationsResponse, UpdateNotificationReadStatus, UpdateNotificationReadStatusResponse } from '@/backend/interfaces/notification/request';
import { getAllNotificationAbout, getAllNotificationTypes } from '@/backend/interfaces/notification';
import logger from '../logger';
import { isAuthenticated } from '@/backend/helpers/auth';

const notificationsRouter = Router();

const NOTIFICATION_MAX_TAKE = 100

    // ############################################################################################################
    // ###############                                                                              ###############
    // ###############                              USER NOTIFICATIONS                              ###############
    // ###############                                                                              ###############
    // ############################################################################################################

    notificationsRouter.get<Record<string, string>, UserNotificationCountResponse | BadRequestResponse>(
    '/:userID/count',
    isAuthenticated,
    async (req, res) => {
        try {
            console.log('req:', req.params.userID)
            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }
            // Get count of user's repositories
            const notificationCount: number = await prisma.notification.count({
                where: {
                    userID: user.id,
                    read: false
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
            res.status(200).json({ success: true, count: notificationCount });
        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'GET: /notifications/count: ',
              });
        return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });


    notificationsRouter.get<Record<string, string>, GetNotificationsResponse | BadRequestResponse>(
    '/:userID',
    isAuthenticated,
    async (req, res) => {

        try {
            
            // const userID = req.params.userID
            let user: User | undefined = req.user;

            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }
            const queryParams: GetNotificationsQueryParams = req.query


            // parse query params
            let query: Prisma.NotificationFindManyArgs = {}

            // Set the request amount to a default fo 10, and a max of 50
            let requestAmt = 10
            if (Number(queryParams.limit)) {
                requestAmt = Number(queryParams.limit) > NOTIFICATION_MAX_TAKE ? NOTIFICATION_MAX_TAKE : Number(queryParams.limit)
            }


            // validate type if provided
            if (queryParams.type) {
                const validTypes = getAllNotificationTypes(false)
                if (!validTypes.includes(queryParams.type)) {
                    return res.status(400).json({success:false, message: `Invalid notification type specified. Type (case sensitive) must be one of: ${validTypes.join(', ')}` });
                }
            }

            // validate about if provided
            if (queryParams.about) {
                const validTypes = getAllNotificationAbout(false)
                if (!validTypes.includes(queryParams.about)) {
                    return res.status(400).json({success:false, message: `Invalid notification about specified. Type (case sensitive) must be one of: ${validTypes.join(', ')}` });
                }
            }

            // find where using specified type and userID
            if ((queryParams.type && queryParams.about) && user) {
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
            } else if (user) {
                query.where = {
                    userID: user.id
                }
            }



            // if no cursor is provided, get a limited number of rows.
            // Default limit is 1
            if (!queryParams.cursor) {
                query.take = Number(requestAmt)
            } else {
                query.take = Number(requestAmt)
                query.skip = 1  // Skip the cursor row.
                query.cursor = {// set the cursor 'page'
                    id: queryParams.cursor
                }
            }

            // set order by and direction
            if (queryParams.orderBy) {
                // Will order by the defined field, default is descending
                query.orderBy = {
                    [queryParams.orderBy]: queryParams.orderDirection ? queryParams.orderDirection : 'desc'
                }
            } else {
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


            const notification: Notification[] = await prisma.notification.findMany(query)
            console.log('projects:', notification)
            const response: GetNotificationsResponse = {
                success: true,
                notifications: notification
            }
            if (notification.length > 0) {
                return res.status(200).json(response);
            } else {
                return res.status(204).json(response);
            }


        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'POST: /notifications: ',
              });
            return res.status(500).json({success:false, message: 'Error' });
        }

    })


    notificationsRouter.put<Record<string, string>, UpdateNotificationReadStatus | BadRequestResponse>(
        '/',
        isAuthenticated,
        async (req, res) => {
            
            // const userID = req.params.userID
            let user:User|undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }

            const reqBody:UpdateNotificationReadStatus = await req.body

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
                return res.status(304).json(response);
            }
    
    
        });
export default notificationsRouter;