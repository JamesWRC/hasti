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
import type { SearchResponse } from '@/backend/interfaces/search';
import tsClient from '@/backend/clients/typesense';
import { GetPopularTagsQueryParams, PopularTagResponse } from '@/backend/interfaces/tag/request';

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
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'GET: /api/v1/tags/search: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

tagsRouter.get<Record<string, string>, PopularTagResponse | BadRequestResponse, any>(
    '/popularTags',
    async (req, res) => {
        try {
            const queryParams = req.query as GetPopularTagsQueryParams;
            const tagType:string|undefined = queryParams.type ? queryParams.type : undefined;
            const limit:number = queryParams.limit ? parseInt(queryParams.limit) : 20;

            // Return a list of tags and the count number of projects using them.
            // NOTE: if IMPLICIT many to many tag to project relationship is changed, this query will need to be updated
            let find: Prisma.TagFindManyArgs = {};

            // select the name and count of projects using the tag
            find.select = {
                name: true,
                _count: {
                    select: {
                        projects: true,
                    },
                },
            }

            // add a where if one is provided
            if (tagType) {
                find.where = {
                    type: tagType,
                };
            }

            // sort by the number of projects using the tag
            find.orderBy = [
                {
                    projects: {
                        _count: 'desc',
                    },
                },
            ];

            // limit the number of tags returned
            find.take = limit;

            // Prisma return type
            interface TagWithCount {
                name: string;
                _count: {
                    projects: number;
                };
            }
            // get the tags from the database
            let tagsWithProjectCount: TagWithCount[] = [];
            tagsWithProjectCount = await (prisma.tag.findMany(find) as unknown) as TagWithCount[];

            // Return the search results as the API response
            const formattedTags:PopularTagResponse = {
                success: true,
                tags: tagsWithProjectCount.map((tag) => {
                    return {
                        name: tag.name,
                        count: tag._count.projects,
                    }
                }),
            }

            // Return the search results as the API response
            res.status(200).json(formattedTags);

        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'GET: /api/v1/tags/search: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    }
);

export default tagsRouter;