import { Router } from 'express';
import { UserProjectCountResponse } from '@/backend/interfaces/user/request';
import { UserType, type User } from '@/backend/interfaces/user';

import { BadRequestResponse } from '@/backend/interfaces/request';
import prisma, { ProjectAllInfo } from '@/backend/clients/prisma/client';
import { Prisma, Repo } from '@prisma/client';
import logger from '@/backend/logger';
import { IncomingForm, Fields, Files, Options } from 'formidable';
import { AddProjectResponse, ChangeProjectOwnershipResponse, DeleteProjectResponse, GetContentResponse, GetProjectsQueryParams, GetProjectsResponse, MAX_FILE_SIZE, ProjectAddMethod, RefreshContentResponse, getProjectAddMethod } from '@/backend/interfaces/project/request';
import { NotificationAbout, NotificationType } from '@/backend/interfaces/notification';
import { Project, getAllProjectTypes, ProjectWithUser, HAInstallType, IoTClassifications } from '@/backend/interfaces/project';
import AWS from 'aws-sdk';
import isValidProjectName, { updateContent, deleteProject, getGitHubRepoData, handleInvalidFiles, handleProjectImages, readFileIfExists, stringToBase64, updateRepoAnalytics } from '@/backend/helpers/project';
import tsClient from '@/backend/clients/typesense';
import type { SearchResponse } from '@/backend/interfaces/search';
import { isAuthenticated } from '@/backend/helpers/auth';
import { OctokitResponse } from '@octokit/types';
import { deleteRepo } from '@/backend/helpers/repo';
import { createTempUser, getTrustworthinessRating } from '@/backend/helpers/user';
import { GHAppSenderWHSender, RepositoryData } from '@/backend/interfaces/repo';
import addOrUpdateRepo from '@/backend/helpers/repo';
import { HACoreVersions } from '@/backend/helpers/homeassistant';
import { DocumentWithUser } from '@/backend/interfaces/project/search';

const projectsRouter = Router();
export const config = {
    api: {
        bodyParser: false, // Disable Next.js default bodyParser
    },
};

const s3 = new AWS.S3({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    accessKeyId: process.env.CLOUDFLARE_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_BUCKET_SECRET_KEY,
});

const PROJECT_MAX_TAKE = 50

projectsRouter.get<Record<string, string>, UserProjectCountResponse | BadRequestResponse>(
    '/:userID/count',
    isAuthenticated,
    async (req, res) => {
        try {
            // logger.info('req:', req.params.userID)
            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }
            const userProjects = await prisma.project.count({
                where: {
                    userID: user.id
                }
            })

            const response: UserProjectCountResponse = {
                success: true,
                count: userProjects
            }

            return res.status(200).json(response);
        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'GET: /projects/:userid/count: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

projectsRouter.get<Record<string, string>, SearchResponse<object> | BadRequestResponse, any>(
    '/search',
    async (req, res) => {
        try {
            // Extract the search query from the request query parameters
            const query = req.query;
            logger.info('query', query);

            let searchParameters = {
                'q': query.q as string,
                'query_by': query.query_by as string,
                ...query
            }

            logger.info('searchParameters', searchParameters);


            const searchOptions = {
                cacheSearchResultsForSeconds: 60

            }

            // Perform the search using the Typesense client
            const searchResults: SearchResponse<object>|null = await tsClient.collections('Project').documents().search(searchParameters, searchOptions).catch((error) => {
                logger.warn(`Request threw an exception getting error from tsClient: ${(error as Error).message} - ${(error as Error).stack}`, {
                    label: 'GET: /api/v1/Project/search: ',
                    });
                    return null
            });

            // Get Author of the projects and add to the search results
            if (searchResults && searchResults.hits) {
                for (let i = 0; i < searchResults.hits.length; i++) {
                    const document = searchResults.hits[i].document as DocumentWithUser;
                    const user = await prisma.user.findFirst({
                        where: {
                            id: document.userID
                        }
                    }).catch((error) => {
                        logger.warn(`Request threw an exception getting error from prisma.user.findFirst: ${(error as Error).message} - ${(error as Error).stack}`, {
                            label: 'GET: /api/v1/Project/search: ',
                        });
                        return null
                });
                    document.user = user

                    searchResults.hits[i].document = document

                }
            }

            // Return the search results as the API response
            res.status(200).json(searchResults? searchResults : {success: false, message: 'Error getting search results'});
        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'GET: /api/v1/Project/search: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });
    
projectsRouter.get<Record<string, string>, GetProjectsResponse | BadRequestResponse>(
    '/',
    async (req, res) => {
        try {

            // const userID = req.params.userID
            let user: User | undefined | null = req.user;
            // if (!user) {
            //     return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            // }

            // parse query params
            const queryParams: GetProjectsQueryParams = req.query
            let query: Prisma.ProjectFindManyArgs = {}
            logger.info("----------queryParams: ", queryParams)
            // Set the request amount to a default fo 10, and a max of 50
            let requestAmt = 10
            if (Number(queryParams.limit)) {
                requestAmt = Number(queryParams.limit) > PROJECT_MAX_TAKE ? PROJECT_MAX_TAKE : Number(queryParams.limit)
            }

            // Set the skip amount if provided
            let skipAmt = 1
            if (Number(queryParams.skip)) {
                skipAmt = Number(queryParams.skip)
            }


            let projectUserID: string | null = '';

            // get userID from username or githubUserID
            if (queryParams.username) {
                user = await prisma.user.findFirst({
                    where: {
                        username: queryParams.username
                    }
                })
            }

            if (queryParams.githubUserID) {
                const gitHubID = Number(queryParams.githubUserID)
                user = await prisma.user.findFirst({
                    where: {
                        githubID: gitHubID
                    }
                })
            }


            // set the userID if provided
            if (queryParams.userID) {
                user = await prisma.user.findFirst({
                    where: {
                        id: queryParams.userID
                    }
                })
            }

            // validate type if provided
            if (queryParams.type) {
                const validTypes = getAllProjectTypes(false)
                if (!validTypes.includes(queryParams.type)) {
                    return res.status(400).json({ success: false, message: `Invalid project type specified. Type (case sensitive) must be one of: ${validTypes.join(', ')}` });
                }
            }

            /**
             * Specify WHERE clause based on query params.
             * In order from specific to less specific params
             */

            // Initialize the base where object
            let where: Prisma.ProjectWhereInput = {};
            let include: Prisma.ProjectInclude = {};

            // Check for user ID and adjust the where clause accordingly
            if (user) {
                where.userID = user.id;
            }

            // Find by ID.
            if (queryParams.projectID) {
                where.id = queryParams.projectID
            }

            // Validate and add project type if specified
            if (queryParams.type) {
                const validTypes = getAllProjectTypes(false);
                if (!validTypes.includes(queryParams.type)) {
                    return res.status(400).json({ success: false, message: `Invalid project type specified. Type (case sensitive) must be one of: ${validTypes.join(', ')}` });
                }
                if (queryParams.username || queryParams.githubUserID || queryParams.userID) {
                    if (user) {
                        where = {
                            AND: [
                                { userID: user.id },
                                { projectType: queryParams.type },
                            ]
                        }
                    }
                } else {
                    where.projectType = queryParams.type;
                }
            }

            // Handle checkImported condition
            if (queryParams.checkImported && user) {
                where.repo = {
                    AND: [
                        { addedByGithubID: { not: user.githubID } },
                        { ownerGithubID: user.githubID }
                    ]
                };
            }

            // Handle ownedOrImported condition
            if (queryParams.ownedOrImported && user) {
                // Ignore any user where.
                where = {};

                where.repo = {
                    OR: [
                        { addedByGithubID: user.githubID },
                        { ownerGithubID: user.githubID }
                    ]
                };
            }

            // Searching by project title must also be user specific
            if (queryParams.projectTitle) {
                // get user specific project
                if (queryParams.username || queryParams.githubUserID || queryParams.userID) {
                    if (user) {
                        where = {
                            AND: [
                                { userID: user.id },
                                { title: queryParams.projectTitle }
                            ]
                        }
                    }
                }

                if(!queryParams.username && !queryParams.githubUserID && !queryParams.userID){
                    where.title = {
                        contains: queryParams.projectTitle
                    }
                }

            }
            logger.info('where user:', user);
            logger.info('where:', where);
            // Assign the dynamically built where clause to the query object
            query.where = where;


            // if no cursor is provided, get a limited number of rows.
            // Default limit is 1
            if (!queryParams.cursor) {
                query.take = Number(requestAmt)
            } else {
                query.take = Number(requestAmt)
                query.skip = skipAmt  // Skip the cursor row.
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

            if (queryParams.allContent) {
                include.repo = {
                    include: {
                        repoAnalytics:{
                            take: 1,
                            orderBy: {
                                createdAt: 'desc'
                            }
                        }
                    },
                }
                include.tags = true
            }

            include.user = {
                omit: {
                    ghuToken: true
                },
            }

            logger.info('query:', query);
            let projects: ProjectWithUser[] | ProjectAllInfo[] = []

            // Check if any where conditions are set
            if (Object.keys(where).length > 0) {
                projects = await prisma.project.findMany({ ...query, include })
            }

            logger.info('projects:', projects);
            const response: GetProjectsResponse = {
                success: true,
                userProjects: projects
            }
            const headers = {
                CacheControl: 'public, max-age=60, stale-while-revalidate=120'
            }
            res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');

            if (projects && projects.length > 0) {

                return res.status(200).json(response);
            } else {
                return res.status(204).json(response);
            }
        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'POST: /projects ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

// projectsRouter.get<Record<string, string>, SearchResponse<object> | BadRequestResponse, any>(
//     '/search',
//     async (req, res) => {
//         try {
//             // Extract the search query from the request query parameters
//             const query = req.query;
//             logger.info('query', query);

//             let searchParameters = {
//                 'q': query.q as string,
//                 'query_by': query.query_by as string,
//                 ...query
//             }

//             logger.info('searchParameters', searchParameters);


//             const searchOptions = {
//                 cacheSearchResultsForSeconds: 60

//             }

//             // Perform the search using the Typesense client
//             const searchResults = await tsClient.collections('Project').documents().search(searchParameters, searchOptions);

//             // Return the search results as the API response
//             res.status(200).json(searchResults);
//         } catch (error) {
//             logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
//                 label: 'GET: /search ',
//             });
//             return res.status(500).json({ success: false, message: 'Error getting token' });
//         }
//     });

projectsRouter.post<Record<string, string>, AddProjectResponse | BadRequestResponse>(
    '/',
    isAuthenticated,
    async (req, res) => {
        const options: Options = {
            maxFileSize: MAX_FILE_SIZE,
            keepExtensions: true,
        };

        const user: User | undefined = req.user;
        let projectOwnerUser: User | undefined = user
        let createdRepo: Repo | null = null;
        let createdProject: Project | null = null;
        let repoData: OctokitResponse<any, number> | null = null

        // simulate slow network
        // await new Promise(resolve => setTimeout(resolve, 500000))

        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
        }

        try {
            const form = new IncomingForm(options);

            const { code, json } = await new Promise<{ code: number, json: AddProjectResponse }>((resolve, reject) => {
                try {
                    form.parse(req, async function (err, fields: Fields, files: Files) {
                        if (err) {

                            // File size too large code
                            if (err.code === 1009) {
                                // Get file Size too large error
                                return resolve(handleInvalidFiles(files));
                            }

                            // code: 1009,
                            // httpCode: 413
                            const response: AddProjectResponse = {
                                success: false,
                                message: 'Something went wrong during the file upload.',
                            }
                            console.error('err', err)
                            return resolve({ code: 500, json: response });
                        }

                        if (!fields) {
                            const response: AddProjectResponse = {
                                success: false,
                                message: 'Missing form fields or files.',
                            }
                            return resolve({ code: 400, json: response });
                        }

                        logger.info("files", files)
                        logger.info("fields", fields)
                        logger.info("user", user)

                        // Handle invalid form field types & missing fields
                        const addMethod: string | null = fields.addMethod ? fields.addMethod[0] : null;
                        const contentFile:string = fields.usinghastiMd && fields.usinghastiMd[0] === 'true' ? 'HASTI' : 'README';
                        const badFormResponse: AddProjectResponse = {
                            success: false,
                            message: 'Invalid form field types.',
                        }
                        if (!(addMethod
                            && fields.repoURL instanceof Array
                            && fields.projectType instanceof Array
                            && fields.haInstallType instanceof Array
                            && fields.name instanceof Array
                            && fields.description instanceof Array
                            && fields.tags instanceof Array
                            && fields.HAVersion instanceof Array
                            && fields.IoTClassification instanceof Array
                        )) {

                            return resolve({ code: 402, json: badFormResponse });
                        } else if (addMethod === ProjectAddMethod.REPO_SELECT.toString() && !(fields.repositoryID instanceof Array)) {
                            return resolve({ code: 401, json: badFormResponse });
                        }



                        /**
                         * Contains logic for adding a project to HASTI via a URL import
                         */
                        if (getProjectAddMethod(addMethod) === ProjectAddMethod.URL_IMPORT) {
                            const repoURLData: string[] = fields.repoURL[0].split('/')
                            const repoOwner: string = repoURLData[3]
                            const repoName: string = repoURLData[4]

                            repoData = await getGitHubRepoData(user, repoOwner, repoName)

                            logger.info('repoData', repoData)
                            if (repoData) {
                                const repoID: number = repoData.data.id
                                const userOwnsRepo: boolean = repoData.data.owner.login === user.username // add to db
                                const ownerType: string = (repoData.data.owner.type as string).toLowerCase() // add to db

                                // Get the owner of the repo
                                const repoOwnerGitHubID: number = repoData.data.owner.id

                                const newUserGitHubNodeID: string = repoData.data.owner.node_id
                                const newUserUsername: string = repoData.data.owner.login
                                const newUserImage: string = repoData.data.owner.avatar_url
                                logger.info('createdRepo repoID', repoID)

                                // Create a 'temp' user if the user doesnt exist.
                                if (!userOwnsRepo) {
                                    const userExists = await prisma.user.findFirst({
                                        where: {
                                            githubID: repoData.data.owner.id
                                        }
                                    })
                                    if (!userExists) {
                                        projectOwnerUser = await createTempUser(repoOwnerGitHubID, newUserGitHubNodeID, newUserUsername, newUserImage, user, repoName)
                                    }else{
                                        // Set the project owner user to the existing user
                                        projectOwnerUser = userExists
                                    }
                                }

                                // Get Repo if it exists.
                                createdRepo = await prisma.repo.findFirst({
                                    where: {
                                        gitHubRepoID: repoID
                                    }
                                })

                                logger.info('createdRepo1', createdRepo)
                                logger.info('projectOwnerUser', projectOwnerUser)
                                // If the repo doesn't exist, AND the user owns it, create it
                                if (!createdRepo && projectOwnerUser) {

                                    const addedByGitHubID: number = user.githubID
                                    const repoOwnerType: string = ownerType
                                    const newRepoData: RepositoryData = {
                                        id: repoID,
                                        node_id: repoData.data.node_id,
                                        name: repoData.data.name,
                                        full_name: repoData.data.full_name,
                                        private: repoData.data.private,
                                    }
                                    logger.info("addOrUpdateRepo", newRepoData, projectOwnerUser, addedByGitHubID, repoOwnerGitHubID, repoOwnerType)
                                    createdRepo = await addOrUpdateRepo(newRepoData, projectOwnerUser, addedByGitHubID, repoOwnerGitHubID, repoOwnerType);

                                } else if (!userOwnsRepo) {
                                    // Return error if the user doesn't own the repo and it already exists
                                    const response: AddProjectResponse = {
                                        success: false,
                                        message: 'Repo already imported. Perhaps fork repository instead.',
                                    }
                                    return resolve({ code: 403, json: response });
                                }

                            }
                            /**
                             * Contains logic for adding a project to HASTI via already imported repo
                             */
                        } else if (getProjectAddMethod(addMethod) === ProjectAddMethod.REPO_SELECT) {

                            if (!(fields.repositoryID instanceof Array)) {
                                logger.info("not array")
                                createdProject ? await deleteProject(createdProject.id) : null
                                createdRepo ? await deleteRepo(createdRepo.id) : null
                                return resolve({ code: 400, json: badFormResponse });
                            }
                        } else {
                            const badFormResponse: AddProjectResponse = {
                                success: false,
                                message: 'Invalid ProjectAddMethod.',
                            }
                            return resolve({ code: 400, json: badFormResponse });
                        }
                        /**
                         * Contains logic for all project add methods
                         */
                        logger.info('createdRepo', createdRepo)

                        // Get the repository ID
                        let repositoryID: string = ''
                        if (getProjectAddMethod(addMethod) === ProjectAddMethod.REPO_SELECT && fields.repositoryID instanceof Array) {
                            repositoryID = fields.repositoryID[0]
                        } else if (getProjectAddMethod(addMethod) === ProjectAddMethod.URL_IMPORT && createdRepo) {
                            repositoryID = createdRepo?.id.toString()
                        }

                        // Get the repo data if it doesn't exist
                        if (!repoData) {
                            logger.info('repositoryID', repositoryID)
                            const savedRepoData = await prisma.repo.findFirst({
                                select: {
                                    fullName: true,
                                },
                                where: {
                                    id: repositoryID
                                }
                            })
                            const repoFullName: string[] | undefined = savedRepoData?.fullName.split('/')
                            if (repoFullName) {
                                const repoOwner: string = repoFullName[0]
                                const repoName: string = repoFullName[1]

                                repoData = await getGitHubRepoData(user, repoOwner, repoName)

                            } else {
                                const response: AddProjectResponse = {
                                    success: false,
                                    message: 'Repo used for project not found.',
                                }
                                createdProject ? await deleteProject(createdProject.id) : null
                                createdRepo ? await deleteRepo(createdRepo.id) : null
                                return resolve({ code: 404, json: response });
                            }
                        }

                        // Get form fields
                        const projectType: string = fields.projectType[0]
                        const haInstallType: string = fields.haInstallType[0]
                        const title: string = fields.name[0]; // The name becomes the title
                        const description: string = fields.description[0];
                        const tags: string = fields.tags[0];
                        const HAVersion: string = fields.HAVersion[0];
                        const IoTClassification: string = fields.IoTClassification[0];

                        if (repositoryID && projectOwnerUser && projectType && haInstallType && title && description && tags && HAVersion && IoTClassification) {

                            // Validate the project name
                            if (!isValidProjectName(title)) {
                                const response: AddProjectResponse = {
                                    success: false,
                                    message: 'Invalid project name. Project names must be alphanumeric, and may contain spaces, dashes, and underscores.',
                                }
                                createdProject ? await deleteProject(createdProject.id) : null
                                createdRepo ? await deleteRepo(createdRepo.id) : null
                                return resolve({ code: 400, json: response });
                            }

                            // Split the tags into an array and remove any empty tags
                            const tagArray = tags.split(',').filter((tag) => tag.trim() !== '');
                            const haInstallTypesArray = haInstallType.split(',').filter((install) => install.trim() !== '');

                            // Determine 'works with' types
                            let worksWithOS: boolean = false
                            let worksWithContainer: boolean = false
                            let worksWithCore: boolean = false
                            let worksWithSupervised: boolean = false
                            let worksWithAny: boolean = haInstallTypesArray.includes(HAInstallType.ANY.toString().toLowerCase())

                            if (haInstallTypesArray.includes(HAInstallType.OS.toString().toLowerCase()) || worksWithAny) {
                                worksWithOS = true
                            }

                            if (haInstallTypesArray.includes(HAInstallType.CONTAINER.toString().toLowerCase()) || worksWithAny) {
                                worksWithContainer = true
                            }

                            if (haInstallTypesArray.includes(HAInstallType.CORE.toString().toLowerCase()) || worksWithAny) {
                                worksWithCore = true
                            }

                            if (haInstallTypesArray.includes(HAInstallType.SUPERVISED.toString().toLowerCase()) || worksWithAny) {
                                worksWithSupervised = true
                            }



                            // Check if the project name already exists
                            const existingProject = await prisma.project.findFirst({
                                where: {
                                    title: title
                                }
                            });

                            if (existingProject) {
                                const response: AddProjectResponse = {
                                    success: false,
                                    message: 'Project name already exists. Please choose a different name.',
                                }
                                createdProject ? await deleteProject(createdProject.id) : null
                                createdRepo ? await deleteRepo(createdRepo.id) : null
                                return resolve({ code: 400, json: response });
                            }

                            const claimed: boolean = user.githubID === repoData?.data.owner.id

                            // Handle the HAVersion, make sure it exists in the known versions
                            if( HACoreVersions.filter((version) => version.version === HAVersion).length === 0){
                                const response: AddProjectResponse = {
                                    success: false,
                                    message: 'Invalid Home Assistant version. Please choose a valid version.',
                                }
                                createdProject ? await deleteProject(createdProject.id) : null
                                createdRepo ? await deleteRepo(createdRepo.id) : null
                                return resolve({ code: 400, json: response });
                            }

                            // Handle iotClassification, make sure it exists in the known classifications
                            if( Object.values(IoTClassifications).filter((classification) => classification === IoTClassification).length === 0){
                                const response: AddProjectResponse = {
                                    success: false,
                                    message: 'Invalid IoT classification. Please choose a valid classification.',
                                }
                                createdProject ? await deleteProject(createdProject.id) : null
                                createdRepo ? await deleteRepo(createdRepo.id) : null
                                return resolve({ code: 400, json: response });
                            }

                            // Create the project
                            createdProject = await prisma.project.create({
                                data: {
                                    title: title,
                                    description: description,
                                    tags: {
                                        // Use connectOrCreate to create and connect tags if they don't exist
                                        connectOrCreate: tagArray.map((tag) => {
                                            return {
                                                where: { name: tag },
                                                create: { name: tag, type: projectType },
                                            };
                                        }),
                                    },
                                    tagNames: tagArray,
                                    published: false, // Hard code false, as the repo needs to be cloned and processed.
                                    userID: projectOwnerUser.id,
                                    repoID: repositoryID,
                                    // Set the 'Works With' types
                                    worksWithOS: worksWithOS,
                                    worksWithContainer: worksWithContainer,
                                    worksWithCore: worksWithCore,
                                    worksWithSupervised: worksWithSupervised,

                                    // Github data
                                    claimed: claimed,
                                    projectType: projectType,

                                    // HA data
                                    worksWithHAVersion: HAVersion,
                                    IoTClassification: IoTClassification,
                                },
                                include: {
                                    tags: {
                                        select: {
                                            name: true,
                                        },
                                    },

                                }
                            });


                            const handledImages = await handleProjectImages(files, createdProject, user)
                            if (handledImages.code !== 200) {
                                // Clean up any created project or repo
                                createdProject ? await deleteProject(createdProject.id) : null
                                createdRepo ? await deleteRepo(createdRepo.id) : null
                                return resolve({ code: handledImages.code, json: handledImages.json });
                            }

                            if (createdProject) {
                                await prisma.notification.create({
                                    data: {
                                        type: NotificationType.SUCCESS,
                                        title: createdProject.title,
                                        message: `Project added`,
                                        about: NotificationAbout.PROJECT,
                                        read: false,

                                        userID: user.id,

                                    }
                                });
                                // Notify the owner of the repo that a project has been added to HASTI
                                if (projectOwnerUser && projectOwnerUser.id !== user.id) {
                                    await prisma.notification.create({
                                        data: {
                                            type: NotificationType.SUCCESS,
                                            title: createdProject.title,
                                            message: `Project add. Added by user: '${user.username}'.`,
                                            about: NotificationAbout.USER,
                                            read: false,

                                            userID: projectOwnerUser.id,
                                        }
                                    });
                                }
                            }

                            // Update content and images
                            const updateResponse = await updateContent(repositoryID, createdProject.id, user.id, contentFile)
                            if (createdProject && createdRepo){
                                await updateRepoAnalytics(projectOwnerUser, createdRepo, createdProject.id, createdProject.repoID)
                            }
                            if (!updateResponse.success) {
                                const response: AddProjectResponse = {
                                    success: false,
                                    message: `Failed to add project content. ${updateResponse.message}`,
                                }
                                // Clean up any created project or repo
                                logger.info('issue deleting project', createdProject)
                                logger.info('issue deleting repo', createdRepo)
                                createdProject ? await deleteProject(createdProject.id) : null
                                createdRepo ? await deleteRepo(createdRepo.id) : null
                                return resolve({ code: 500, json: response });
                            } else {
                                const response: AddProjectResponse = {
                                    success: true,
                                    message: 'Project added successfully',
                                    project: createdProject,
                                }

                                return resolve({ code: 200, json: response });

                            }
                            
                        } else {
                            const missingFields = [];
                            if (!repositoryID) missingFields.push('repositoryID');
                            if (!projectType) missingFields.push('projectType');
                            if (!haInstallType) missingFields.push('haInstallType');
                            if (!title) missingFields.push('name');
                            if (!description) missingFields.push('description');
                            if (!tags) missingFields.push('tags');
                            if (!HAVersion) missingFields.push('HAVersion');
                            if (!IoTClassification) missingFields.push('IoTClassification');

                            const response: AddProjectResponse = {
                                success: false,
                                message: 'Missing required form fields: ' + missingFields.join(', '),
                            }
                            // Clean up any created project or repo
                            createdProject ? await deleteProject(createdProject.id) : null
                            createdRepo ? await deleteRepo(createdRepo.id) : null
                            return resolve({ code: 400, json: response });
                        }
                    });
                } catch (e) {
                    console.log(e)
                    const response: AddProjectResponse = {
                        success: false,
                        message: 'Something went wrong during the file upload. catch all.',
                    }
                    return resolve({ code: 500, json: response });
                }
            });


            return res.status(code).json(json)

        } catch (error) {

            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'POST: /projects/',
            });
            return res.status(500).json({ success: false, message: 'Error creating Project' });
        }

    });

projectsRouter.put<Record<string, string>, AddProjectResponse | BadRequestResponse>(
    '/',
    isAuthenticated,
    async (req, res) => {
        const options: Options = {
            maxFileSize: MAX_FILE_SIZE,
            keepExtensions: true,
        };

        const user: User | undefined = req.user;

        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
        }

        try {
            const form = new IncomingForm(options);

            const { code, json } = await new Promise<{ code: number, json: AddProjectResponse }>((resolve, reject) => {
                try {
                    form.parse(req, async function (err, fields: Fields, files: Files) {
                        if (err) {

                            // File size too large code
                            if (err.code === 1009) {
                                // Get file Size too large error
                                return resolve(handleInvalidFiles(files));
                            }

                            // code: 1009,
                            // httpCode: 413
                            const response: AddProjectResponse = {
                                success: false,
                                message: 'Something went wrong during the file upload.',
                            }
                            return resolve({ code: 500, json: response });
                        }

                        if (!fields) {
                            const response: AddProjectResponse = {
                                success: false,
                                message: 'Missing form fields or files.',
                            }
                            return resolve({ code: 400, json: response });
                        }

                        // // Handle invalid form field types & missing fields

                        if (fields.repositoryID instanceof Array
                            && fields.projectID instanceof Array
                            && fields.projectType instanceof Array
                            && fields.description instanceof Array
                            && fields.haInstallType instanceof Array
                            && fields.tags instanceof Array
                            && fields.HAVersion instanceof Array
                            && fields.IoTClassification instanceof Array
                        ) {

                            const repositoryID: string = fields.repositoryID[0];
                            const projectID: string = fields.projectID[0];
                            const projectType: string = fields.projectType[0]
                            const description: string = fields.description[0];
                            const haInstallType: string = fields.haInstallType[0];
                            const tags: string = fields.tags[0];
                            const contentFile:string = fields.usinghastiMd && fields.usinghastiMd[0] === 'true' ? 'HASTI' : 'README';
                            const HAVersion: string = fields.HAVersion[0];
                            const IoTClassification: string = fields.IoTClassification[0];

                            logger.info('fields', fields)
                            logger.info('contentFile', contentFile)
                            let repo: Repo | null = await prisma.repo.findFirst({
                                where: {
                                    id: repositoryID
                                }
                            })

                            let project: Project | null = await prisma.project.findFirst({
                                where: {
                                    id: projectID,
                                    // userID: user.id // Cant remember if this check is important with the claimed check below?
                                }
                            })

                            if (repo && project) {

                                // Check if user has permission to update project
                                let userHasPermissionToUpdate: boolean = false
                                // If user is the owner of the project
                                if (project.claimed && project.userID === user.id) {
                                    userHasPermissionToUpdate = true

                                } else if (!project.claimed && repo.addedByGithubID === user.githubID) {
                                    userHasPermissionToUpdate = true
                                }

                                if (!userHasPermissionToUpdate) {
                                    const response: AddProjectResponse = {
                                        success: false,
                                        message: 'User does not have permission to update project.',
                                    }
                                    return resolve({ code: 403, json: response });

                                } else {

                                    // Split the tags into an array and remove any empty tags
                                    const tagArray = tags.split(',').filter((tag) => tag.trim() !== '');
                                    const haInstallTypesArray = haInstallType.split(',').filter((install) => install.trim() !== '');

                                    // Determine 'works with' types
                                    let worksWithOS: boolean = false
                                    let worksWithContainer: boolean = false
                                    let worksWithCore: boolean = false
                                    let worksWithSupervised: boolean = false
                                    let worksWithAny: boolean = haInstallTypesArray.includes(HAInstallType.ANY.toString().toLowerCase())

                                    if (haInstallTypesArray.includes(HAInstallType.OS.toString().toLowerCase()) || worksWithAny) {
                                        worksWithOS = true
                                    }

                                    if (haInstallTypesArray.includes(HAInstallType.CONTAINER.toString().toLowerCase()) || worksWithAny) {
                                        worksWithContainer = true
                                    }

                                    if (haInstallTypesArray.includes(HAInstallType.CORE.toString().toLowerCase()) || worksWithAny) {
                                        worksWithCore = true
                                    }

                                    if (haInstallTypesArray.includes(HAInstallType.SUPERVISED.toString().toLowerCase()) || worksWithAny) {
                                        worksWithSupervised = true
                                    }

                                    // Handle the HAVersion, make sure it exists in the known versions
                                    if( HACoreVersions.filter((version) => version.version === HAVersion).length === 0){
                                        const response: AddProjectResponse = {
                                            success: false,
                                            message: 'Invalid Home Assistant version. Please choose a valid version.',
                                        }

                                        return resolve({ code: 400, json: response });
                                    }

                                    // Handle iotClassification, make sure it exists in the known classifications
                                    if( Object.values(IoTClassifications).filter((classification) => classification === IoTClassification).length === 0){
                                        const response: AddProjectResponse = {
                                            success: false,
                                            message: 'Invalid IoT classification. Please choose a valid classification.',
                                        }

                                        return resolve({ code: 400, json: response });
                                    }

                                    let update: Prisma.ProjectUpdateInput = {
                                        description: description,
                                        // Set the tags
                                        tags: {
                                            // Use connectOrCreate to create and connect tags if they don't exist
                                            connectOrCreate: tagArray.map((tag) => {
                                                return {
                                                    where: { name: tag },
                                                    create: { name: tag, type: projectType },
                                                };
                                            }),
                                            // Remove any that have been removed
                                            deleteMany: {
                                                name: { notIn: tagArray }
                                            }
                                        },
                                        tagNames: tagArray,
                                        // Set the 'Works With' types
                                        worksWithOS: worksWithOS,
                                        worksWithContainer: worksWithContainer,
                                        worksWithCore: worksWithCore,
                                        worksWithSupervised: worksWithSupervised,

                                        // HA data
                                        worksWithHAVersion: HAVersion,
                                        IoTClassification: IoTClassification,
                                    }

                                    // Update the project images
                                    await handleProjectImages(files, project, user)
                                    const repoData: RepositoryData = {
                                        id: repo.gitHubRepoID,
                                        node_id: repo.gitHubNodeID,
                                        name: repo.name,
                                        full_name: repo.fullName,
                                        private: repo.private,

                                    }
                                    // Update repo data
                                    repo = await addOrUpdateRepo(repoData, user, user.githubID, repo.ownerGithubID, repo.ownerType);

                                    // Update the project
                                    project = await prisma.project.update({
                                        where: {
                                            id: project.id
                                        },
                                        data: update
                                    })

                                    // Update content and images
                                    const updateResponse = await updateContent(repositoryID, project.id, user.id, contentFile)

                                    if (!updateResponse.success) {
                                        const response: AddProjectResponse = {
                                            success: false,
                                            message: `Failed to add project content. ${updateResponse.message}`,
                                        }
  
                                        return resolve({ code: 500, json: response });
                                    } else {

                                        const response: AddProjectResponse = {
                                            success: true,
                                            message: 'Project added successfully',
                                            project: project,
                                        }
                                        return resolve({ code: 200, json: response });
                                    }


                                }

                            }else{
                                const response: AddProjectResponse = {
                                    success: false,
                                    message: 'Missing Repo and or Project was not found.',
                                }
                                return resolve({ code: 400, json: response });
                            }

                        } else {
                            const missingFields = [];
                            if (!fields.repositoryID) missingFields.push('repositoryID');
                            if (!fields.projectID) missingFields.push('projectID');
                            if (!fields.projectType) missingFields.push('projectType');
                            if (!fields.description) missingFields.push('description');
                            if (!fields.haInstallType) missingFields.push('haInstallType');
                            if (!fields.tags) missingFields.push('tags');

                            const response: AddProjectResponse = {
                                success: false,
                                message: 'Missing required form fields: ' + missingFields.join(', '),
                            }
                            return resolve({ code: 400, json: response });

                        }

                    });
                } catch (e) {
                    console.log(e)
                    const response: AddProjectResponse = {
                        success: false,
                        message: 'Something went wrong. Failed to update project.',
                    }
                    return resolve({ code: 500, json: response });
                }
            });

            return res.status(code).json(json)

        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'PUT: /projects/ ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

projectsRouter.delete<Record<string, string>, DeleteProjectResponse | BadRequestResponse>(
    '/:projectID',
    isAuthenticated,
    async (req, res) => {
        try {
            logger.info('req:', req.params.projectID)
            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }
            const userProject = await prisma.project.findFirst({
                where: {
                    AND: [
                        { userID: user.id },
                        { id: req.params.projectID },
                    ]
                },
                include: {
                    repo: true,
                }
            })

            if (userProject) {
                await prisma.project.delete({
                    where: {
                        id: userProject.id
                    }
                })
                // If the project is not claimed, delete the repo
                if(!userProject.claimed && user.githubID !== userProject.repo.ownerGithubID){
                    await prisma.repo.delete({
                        where: {
                            id: userProject.repoID
                        }
                    })
                }


                // Notify the owner of the repo that a project has been deleted
                await prisma.notification.create({
                    data: {
                        type: NotificationType.SUCCESS,
                        title: userProject.title,
                        message: `The project: '${userProject.title}' has been deleted by user: '${user.username}'.`,
                        about: NotificationAbout.PROJECT,
                        read: false,
                        userID: userProject.userID,
                    }
                });
                return res.status(200).json({ success: true, projectID: userProject.id});
            }else{
                return res.status(404).json({ success: false, message: 'Project not found.' });
            }

        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'DELETE: /projects/:projectID: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

    

projectsRouter.put<Record<string, string>, ChangeProjectOwnershipResponse | BadRequestResponse>(
    '/claim/:projectID',
    isAuthenticated,
    async (req, res) => {
        try {
            logger.info('req:', req.params.projectID)
            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }
            const userProject = await prisma.project.findFirst({
                where: {
                    AND: [
                        { repo: { ownerGithubID: { equals: user.githubID } } },
                        { id: req.params.projectID }
                    ]
                },
                include: {
                    repo: true,
                    user: true
                }
            })

            if (userProject) {
                // Check if user has permission to claim project
                let userHasPermissionToClaim: boolean = false
                // If user is the owner of the project
                if (!userProject.claimed && userProject.repo.ownerGithubID === user.githubID) {
                    userHasPermissionToClaim = true
                }

                if(userHasPermissionToClaim){
                    // Claim the project
                    await prisma.project.update({
                        where: {
                            id: userProject.id
                        },
                        data: {
                            claimed: true,
                            userID: user.id
                        }
                    })

                    // Update the repo owner
                    await prisma.repo.update({
                        where: {
                            id: userProject.repo.id
                        },
                        data: {
                            userID: user.id
                        }
                    })

                    // Notify the owner of the repo that a project has been claimed
                    await prisma.notification.create({
                        data: {
                            type: NotificationType.SUCCESS,
                            title: userProject.title,
                            message: `The project you imported: '${userProject.title}' has been claimed by user: '${user.username}'. You no longer have ownership of this project.`,
                            about: NotificationAbout.PROJECT,
                            read: false,
                            userID: userProject.repo.userID,
                        }
                    });

                    // Notify the user that claimed the project
                    await prisma.notification.create({
                        data: {
                            type: NotificationType.SUCCESS,
                            title: userProject.title,
                            message: `You have claimed the project: '${userProject.title}'. You are now the owner of this project.`,
                            about: NotificationAbout.PROJECT,
                            read: false,
                            userID: user.id,
                        }
                    });

                    return res.status(200).json({ success: true, newOwnerID: user.id, projectID: userProject.id});
                }else{
                    return res.status(403).json({ success: false, message: 'User does not have permission to claim project.' });
                }

            }else{
                return res.status(404).json({ success: false, message: 'Project not found. Or you dont own repo that the project uses.' });
            }

        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'DELETE: /projects/:projectID: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });


projectsRouter.put<Record<string, string>, RefreshContentResponse | BadRequestResponse>(
    '/:projectID/content',
    isAuthenticated,
    async (req, res) => {
        try {
            logger.info('req:', req.params.projectID)
            logger.info('file:', req.query.updateContentFile)
            const projectID: string = req.params.projectID
            const updateContentFile: string = req.query.updateContentFile as string
            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }

            const project = await prisma.project.findFirst({
                where: {
                    id: projectID
                },
                include: {
                    user: true,      
                    repo: true,              
                }
            })


            if(project){
                let contentFile = 'README'
                if(updateContentFile === 'HASTI'){
                    contentFile = 'HASTI'
                }

                // Update the project config to use HASTI MD if the user has requested to update the content from HASTI MD/
                if(!project.usingHastiMD && contentFile === 'HASTI'){
                    await prisma.project.update({
                        where: {
                            id: project.id
                        },
                        data: {
                            usingHastiMD: true
                        }
                    })
                }

                const updatedData:RefreshContentResponse = await updateContent(project.repoID, project.id, project.user.id, contentFile)

                if(project?.user){

                    await updateRepoAnalytics(project.user, project.repo, project.id, project.repoID)

                }


                return res.status(200).json(updatedData);

            }

            
            return res.status(404).json({ success: false, message: 'Project not found.' });

        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'DELETE: /projects/:projectID: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

    /**
     * Get project content
     * @param projectID
     * @param contentSHA - used for caching / versioning
     * @returns {GetContentResponse | BadRequestResponse}
     * @description Get project content / readme base64
     */
    projectsRouter.get<Record<string, string>, GetContentResponse | BadRequestResponse>(
        '/:projectID/content/:contentSHA',
        async (req, res) => {
            try {
                logger.info('req:', req.params.projectID)

                const projectID: string = req.params.projectID

                const project = await prisma.project.findFirst({
                    where: {
                        id: projectID
                    },
                    select: {
                        contentSHA: true,
                        id: true,
                        repoID: true,
                        userID: true,
                        usingHastiMD: true,
                        user: true,
                        repo: {
                            select:{
                                name: true,
                            }
                        }
                    }
                })

                if(project){
                    const contentSHA:string = project.contentSHA
                    const filePath:string = './temp/projects/' + projectID + '/' + contentSHA + '/content.md'
                    logger.info('filePath:', filePath)
                    // Get the content from the file system
                    const cachedContent:string|null = await readFileIfExists(filePath)
                    if(cachedContent){
                        return res.status(200).json({ success: true, sha: contentSHA, content: stringToBase64(cachedContent)});
                    }else{
                        // If the content doesn't exist, update it and return base64 encoded content
                        console.log(project.repoID, project.id, project.userID)
                        let contentFile = 'README'
                        if(project.usingHastiMD){
                            contentFile = 'HASTI'
                        }
                        await updateContent(project.repoID, project.id, project.userID, contentFile, true)
                        const content = await readFileIfExists(filePath)
                        logger.info('content:', content)
                        if(content){
                            return res.status(200).json({ success: true, sha: contentSHA, content: stringToBase64(content)});
                        }else{

                        }
                    }

                    return res.status(204).json({ success: false, sha: contentSHA, content: ''});
    
                }
    
                
                return res.status(204).json({ success: false, message: 'Project not found.' });
    
            } catch (error) {
                logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                    label: 'GET: /:projectID/content/:contentSHA ',
                });
                return res.status(500).json({ success: false, message: 'Error getting token' });
            }
        });
    

export default projectsRouter;