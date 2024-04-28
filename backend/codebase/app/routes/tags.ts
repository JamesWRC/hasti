import { Router } from 'express';
import { UserNotificationCountResponse } from '@/backend/app/interfaces/user/request';
import type { User } from '@/backend/app/interfaces/user';
import type { Notification } from '@/backend/app/interfaces/notification';
// import { JWTResult, handleUserJWTPayload } from '@/backend/app/helpers/user';
import { BadRequestResponse } from '@/backend/app/interfaces/request';
import prisma from '@/backend/app/clients/prisma/client';
import { Prisma } from '@prisma/client';
import { GetNotificationsQueryParams, GetNotificationsResponse, UpdateNotificationReadStatus, UpdateNotificationReadStatusResponse } from '@/backend/app/interfaces/notification/request';
import { getAllNotificationAbout, getAllNotificationTypes } from '@/backend/app/interfaces/notification';
import logger from '../logger';
import type { SearchResponse } from '@/backend/app/interfaces/search';
import tsClient from '@/backend/app/clients/typesense';

const tagsRouter = Router();

tagsRouter.get<Record<string, string>, SearchResponse<object> | BadRequestResponse, any>(
    '/search',
    async (req, res) => {
        try {
            // Extract the search query from the request query parameters
            const query = req.query;
            console.log('query', query);

            let searchParameters = {
                'q': query.q as string,
                'query_by': query.query_by as string,
                ...query
            }

            console.log('searchParameters', searchParameters);


            const searchOptions = {
                cacheSearchResultsForSeconds: 60

            }

            // Perform the search using the Typesense client
            const searchResults = await tsClient.collections('Tag').documents().search(searchParameters, searchOptions);

            // Return the search results as the API response
            res.status(200).json(searchResults);
        } catch (error) {
            logger.warn(`Request threw an exception: ${error}`, {
                label: 'GET: /api/v1/tags/search: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

export default tagsRouter;