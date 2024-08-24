import { Router } from 'express';
import { AdminGetUsersResponse, GetUsersQueryParams, UserNotificationCountResponse } from '@/backend/interfaces/user/request';
import { UserType, type User } from '@/backend/interfaces/user';
import type { Notification } from '@/backend/interfaces/notification';
// import { JWTResult, handleUserJWTPayload } from '@/backend/helpers/user';
import { BadRequestResponse } from '@/backend/interfaces/request';
import prisma from '@/backend/clients/prisma/client';
import { Prisma } from '@prisma/client';
import { GetNotificationsQueryParams, GetNotificationsResponse, UpdateNotificationReadStatus, UpdateNotificationReadStatusResponse } from '@/backend/interfaces/notification/request';
import { getAllNotificationAbout, getAllNotificationTypes } from '@/backend/interfaces/notification';
import logger from '../logger';
import { isAuthenticated, isAuthorised } from '@/backend/helpers/auth';

const userRouter = Router();




// Get all users with pagination
userRouter.get<Record<string, string>, AdminGetUsersResponse | BadRequestResponse>(
    '/',
    isAuthenticated,
    isAuthorised(UserType.ADMIN),
    async (req, res) => {
        try {
            // get jwt header from request
            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'You do not have permissions.' });
            }

            const queryParams: GetUsersQueryParams = req.query
            let query: Prisma.UserFindManyArgs = {}

            // Set the limit of the number of users to fetch
            query.take = parseInt(queryParams.limit?.toString() || "10")

            // search by username where name is part of the username in the db
            if (queryParams.username) query.where = { username: { contains: queryParams.username } }

            // set orderBy if it exists
            if (queryParams.orderBy) query.orderBy = { [queryParams.orderBy]: queryParams.orderDirection || 'desc' }

            // set the skip to the next 'page' of users
            if (queryParams.skip) query.skip = parseInt(queryParams.skip?.toString() || "10")

            // get all users
            const users = await prisma.user.findMany(query)

            // Count the number of users
            const totalUsers = await prisma.user.count()

            return res.status(200).json({ success: true, users: users, totalUsers: totalUsers });


        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'GET: /auth/gitUserToken: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

export default userRouter;