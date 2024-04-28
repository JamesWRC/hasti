import { Router } from 'express';
import { UserNotificationCountResponse, UserProjectCountResponse } from '@/backend/app/interfaces/user/request';
import { UserType, type User } from '@/backend/app/interfaces/user';
import type { Notification } from '@/backend/app/interfaces/notification';
// import { JWTResult, handleUserJWTPayload } from '@/backend/app/helpers/user';
import { BadRequestResponse } from '@/backend/app/interfaces/request';
import prisma from '@/backend/app/clients/prisma/client';
import { Prisma, Repo } from '@prisma/client';
import { GetNotificationsQueryParams, GetNotificationsResponse, UpdateNotificationReadStatus, UpdateNotificationReadStatusResponse } from '@/backend/app/interfaces/notification/request';
import { getAllNotificationAbout, getAllNotificationTypes } from '@/backend/app/interfaces/notification';
import logger from '../logger';
import { IncomingForm, Fields, Files, Options } from 'formidable';
import { AddProjectResponse, GetProjectContentResponse, GetProjectsQueryParams, GetProjectsResponse, MAX_FILE_SIZE, ProjectAddMethod, getProjectAddMethod } from '@/backend/app/interfaces/project/request';
import { NotificationAbout, NotificationType } from '@/backend/app/interfaces/notification';
import { Project, getAllProjectTypes, ProjectWithUser } from '@/backend/app/interfaces/project';
import AWS from 'aws-sdk';
import fs from 'fs';
import updateContent, { deleteProject, getGitHubRepoData } from '@/backend/app/helpers/project';
import tsClient from '@/backend/app/clients/typesense';
import type { SearchResponse } from '@/backend/app/interfaces/search';
import path from 'path'
import { isAuthenticated } from '@/backend/app/helpers/auth';
import { OctokitResponse } from '@octokit/types';
import { deleteRepo } from '../helpers/repo';

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
            // console.log('req:', req.params.userID)
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
            logger.warn(`Request threw an exception: ${error}`, {
                label: 'GET: /projects/:userid/count: ',
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

            // Set the request amount to a default fo 10, and a max of 50
            let requestAmt = 10
            if (Number(queryParams.limit)) {
                requestAmt = Number(queryParams.limit) > PROJECT_MAX_TAKE ? PROJECT_MAX_TAKE : Number(queryParams.limit)
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

            // find where using specified type and userID
            if (queryParams.type && user) {
                // validate type
                query.where = {
                    AND: [
                        { userID: user.id },
                        { projectType: queryParams.type }
                    ]
                }
            // find find all projects that was added by a different user
            } else if(queryParams.checkImported && user){
                console.log('checkImported:', queryParams.checkImported)
                query.where = {
                    repo: {
                        AND: [
                            { addedByGithubID: { not: user.githubID } },
                            { ownerGithubID: user.githubID }
                        ]
                    }
                }
            // Will find all projects owned or imported by the user
            } else if(queryParams.ownedOrImported && user){
                console.log('ownedOrImported:', queryParams.ownedOrImported)
                query.where = {
                    repo: {
                        OR: [
                            { addedByGithubID: user.githubID },
                            { ownerGithubID: user.githubID }
                        ]
                    }
                }
            // find where using specified type
            } else if (queryParams.type) {
                console.log('type:', queryParams.type)
                query.where = {
                    projectType: queryParams.type
                }
            // find where using specified userID
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


            const projects: ProjectWithUser[] = await prisma.project.findMany({ ...query, include: { user: true } })

            console.log('projects:', projects);
            const response: GetProjectsResponse = {
                success: true,
                userProjects: projects
            }
            if (projects && projects.length > 0) {

                return res.status(200).json(response);
            } else {
                return res.status(204).json(response);
            }
        } catch (error) {
            logger.warn(`Request threw an exception: ${error}`, {
                label: 'GET: /projects/:userid/count: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

projectsRouter.get<Record<string, string>, GetProjectContentResponse | BadRequestResponse, any>(
    '/:projectID/content',
    async (req, res) => {
        try {
            // Read and get the text of the text.md file
            const filePath = path.join(process.cwd(), 'test-readme.md');
            const fileContents = fs.readFileSync(filePath, 'utf8');

            // const host = checkHost(req)

            // if(!host){
            // return badHost(res)
            // }

            // // Add cors headers
            // res.setHeader('Access-Control-Allow-Credentials', 'true')
            // res.setHeader('Access-Control-Allow-Origin', host)
            // res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
            // res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
            // res.setHeader('Content-Type', 'text/plain')


            // Return the text of the text.md file
            // Set headers as text/plain
            return res.status(200).json({success:true, content: fileContents})

        } catch (error) {
            logger.warn(`Request threw an exception: ${error}`, {
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
            const searchResults = await tsClient.collections('Project').documents().search(searchParameters, searchOptions);

            // Return the search results as the API response
            res.status(200).json(searchResults);
        } catch (error) {
            logger.warn(`Request threw an exception: ${error}`, {
                label: 'GET: /projects/:userid/count: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

projectsRouter.post<Record<string, string>, AddProjectResponse | BadRequestResponse>(
    '/add',
    isAuthenticated,
    async (req, res) => {
        const options: Options = {
            maxFileSize: MAX_FILE_SIZE,
            keepExtensions: true,
        };

        const user: User | undefined = req.user;
        let projectOwnerUser: User | undefined = user
        let createdRepo: Repo|null = null;
        let createdProject: Project|null = null;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
        }

        try {
            const form = new IncomingForm(options);

            const { code, json } = await new Promise<{ code: number, json: AddProjectResponse }>((resolve, reject) => {
                try{
                    form.parse(req, async function (err, fields: Fields, files: Files) {
                        if (err) {

                            // File size too large code
                            if (err.code === 1009) {
                                // console.log(err)
                                // Gte file Size too large error
                                const okFiles = Object.keys(files).map((fieldName) => {
                                    const file = files[fieldName];
                                    if (file) {
                                        console.log(file)
                                        return fieldName
                                    }
                                })
                                const response: AddProjectResponse = {
                                    success: false,
                                    message: 'File size too large. Max File Size: 10MB.',
                                }
                                console.log("okFiles", okFiles)
                                if (okFiles.length > 0) {
                                    response.extraInfo = 'File fields OK: ' + okFiles.join(', ')
                                }

                                return resolve({ code: 413, json: response });

                            }

                            // code: 1009,
                            // httpCode: 413
                            const response: AddProjectResponse = {
                                success: false,
                                message: 'Something went wrong during the file upload.',
                            }
                            return resolve({ code: 500, json: response });
                        }

                        if (!fields || !files) {
                            const response: AddProjectResponse = {
                                success: false,
                                message: 'Missing form fields or files or.',
                            }
                            return resolve({ code: 400, json: response });
                        }

                        // Handle invalid form field types & missing fields
                        const addMethod:string|null = fields.addMethod ? fields.addMethod[0] : null;
                        const badFormResponse: AddProjectResponse = {
                            success: false,
                            message: 'Invalid form field types.',
                        }
                        console.log("fields", fields)
                        if (!(addMethod
                            && fields.repoURL instanceof Array
                            && fields.projectType instanceof Array
                            && fields.haInstallType instanceof Array
                            && fields.name instanceof Array
                            && fields.description instanceof Array
                            && fields.tags instanceof Array)) {
                            
                                console.log(fields.addMethod instanceof Array)
                                console.log(fields.repoURL instanceof Array)
                                console.log(fields.projectType instanceof Array)
                                console.log(fields.haInstallType instanceof Array)
                                console.log(fields.name instanceof Array)
                                console.log(fields.description instanceof Array)
                                console.log(fields.tags instanceof Array)
                                
                            
                            return resolve({ code: 402, json: badFormResponse });
                        }else if(addMethod === ProjectAddMethod.REPO_SELECT.toString() && !(fields.repositoryID instanceof Array)){
                            return resolve({ code: 401, json: badFormResponse });
                        }

                        console.log("addMethod", addMethod)
                        console.log(getProjectAddMethod(addMethod) === ProjectAddMethod.REPO_SELECT)
                        console.log(getProjectAddMethod(addMethod) === ProjectAddMethod.URL_IMPORT)
                        if(getProjectAddMethod(addMethod) === ProjectAddMethod.URL_IMPORT){
                            const repoURLData:string[] = fields.repoURL[0].split('/')
                            const repoOwner:string = repoURLData[3]
                            const repoName:string = repoURLData[4]
                            const repoData:OctokitResponse<any, number> | null = await getGitHubRepoData(user, repoOwner, repoName)


                            if(repoData){
                                const repoID:number = repoData.data.id
                                const userOwnsRepo:boolean = repoData.data.owner.login === user.username // add to db
                                const ownerType:string = (repoData.data.owner.type as string).toLowerCase() // add to db

                                // Create a 'temp' user if the user doesnt exist.
                                if(!userOwnsRepo){
                                    const userExists = await prisma.user.findFirst({
                                        where: {
                                            githubID: repoData.data.owner.id
                                        }
                                    })
                                    if(!userExists){
                                        projectOwnerUser = await prisma.user.create({
                                            data: {
                                                githubID: repoData.data.owner.id,    
                                                username: repoData.data.owner.login,     
                                                image: repoData.data.owner.avatar_url,
                                                type: UserType.TEMP,
                                                ghuToken: user.ghuToken // Use the authenticated Users token for the temp user.

                                            }
                                        })
                                    }
                                }

                                // Get Repo if it exists.
                                createdRepo = await prisma.repo.findFirst({
                                    where: {
                                        gitHubRepoID: repoID
                                    }
                                })
                                
                                
                                // If the repo doesn't exist, AND the user owns it, create it
                                if(!createdRepo && projectOwnerUser){
                                    // Create new repo
                                    createdRepo = await prisma.repo.create({
                                        data:{
                                            gitHubRepoID: repoID,
                                            name: repoData.data.name,
                                            fullName: repoData.data.full_name,
                                            private: repoData.data.private,
                                            
                                            userID: projectOwnerUser.id,    

                                            gitHubNodeID: repoData.data.node_id,
                                            gitHubStars: repoData.data.stargazers_count,
                                            gitHubWatchers: repoData.data.watchers_count,
                                            gitAppHasAccess: true,
                                            ownerGithubID: repoData.data.owner.id,
                                            ownerType: ownerType,
                                            addedByGithubID: user.githubID, // User ID of the importer
                                        }
                                    })
                                }else if(!userOwnsRepo){
                                    // Return error if the user doesn't own the repo and it already exists
                                    const response: AddProjectResponse = {
                                        success: false,
                                        message: 'Repo already imported. Perhaps fork repository instead.',
                                    }
                                    return resolve({ code: 403, json: response });
                                }
                                
                            }
                        }else if(getProjectAddMethod(addMethod) === ProjectAddMethod.REPO_SELECT){
                            if(!(fields.repositoryID instanceof Array)){
                                console.log("not array")
                                createdProject ? await deleteProject(createdProject.id):null
                                createdRepo ? await deleteRepo(createdRepo.id):null
                                return resolve({ code: 400, json: badFormResponse });
                            }
                        }else{
                            const badFormResponse: AddProjectResponse = {
                                success: false,
                                message: 'Invalid ProjectAddMethod.',
                            }
                            return resolve({ code: 400, json: badFormResponse });
                        }
                        // Get the repository ID
                        let repositoryID: string = ''
                        if(getProjectAddMethod(addMethod) === ProjectAddMethod.REPO_SELECT && fields.repositoryID instanceof Array){
                            repositoryID = fields.repositoryID[0]
                        }else if(getProjectAddMethod(addMethod) === ProjectAddMethod.URL_IMPORT && createdRepo){
                            repositoryID = createdRepo?.id.toString()
                        }

                        // Get form fields
                        const projectType: string = fields.projectType[0]
                        const haInstallType: string = fields.haInstallType[0]
                        const title: string = fields.name[0]; // The name becomes the title
                        const description: string = fields.description[0];
                        const tags: string = fields.tags[0];

                        console.log("== DEBUG")
                        console.log(repositoryID, projectType, haInstallType, title, description, tags)

                        if (repositoryID && projectOwnerUser && projectType && haInstallType && title && description && tags) {
                            // Split the tags into an array and remove any empty tags
                            const tagArray = tags.split(',').filter((tag) => tag.trim() !== '');
                            console.log("== DEBUG")
                            console.log(repositoryID, projectOwnerUser, projectType, haInstallType, title, description, tags)
                            createdProject = await prisma.project.create({
                                data: {
                                    title: title,
                                    content: '',    // Hard code empty content, as the repo needs to be cloned and processed.
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
                                    published: false, // Hard code false, as the repo needs to be cloned and processed.
                                    userID: projectOwnerUser.id,
                                    repoID: repositoryID,
                                    haInstallType: haInstallType,
                                    projectType: projectType,
                                },
                                include: {
                                    tags: {
                                        select: {
                                            name: true,
                                        },
                                    },

                                }
                            });


                            // Handle any files
                            Object.keys(files).map(async (fieldName) => {
                                const file = files[fieldName];

                                if (file && createdProject) {

                                    const filePath = file[0].filepath
                                    const fileName = file[0].originalFilename
                                    const readStream = fs.createReadStream(filePath);

                                    const fileUploadPath = `user/${user.id}/${createdProject.id}/${fileName}`

                                    const s3Params = {
                                        Bucket: process.env.CLOUDFLARE_BUCKET_NAME as string,
                                        Key: fileUploadPath,
                                        ContentType: file[0].mimetype ?? 'image/jpeg',
                                        Body: readStream,
                                    };

                                    // upload the file to the S3 (R2) bucket
                                    s3.upload(s3Params, (s3Err: any, data: any) => {
                                        if (s3Err) {
                                            console.error('Error uploading to S3: ', s3Err);

                                            const response: AddProjectResponse = {
                                                success: false,
                                                message: 'Something went wrong during the file upload.',
                                            }
                                            return resolve({ code: 500, json: response });
                                        }
                                    });

                                    // Save the file path to the project for image content
                                    if (fieldName === 'profileImage') {
                                        await prisma.project.update({
                                            where: { id: createdProject.id },
                                            data: {
                                                profileImage: fileUploadPath
                                            }
                                        });
                                    } else if (fieldName === 'backgroundImage') {
                                        await prisma.project.update({
                                            where: { id: createdProject.id },
                                            data: {
                                                backgroundImage: encodeURIComponent(fileUploadPath)
                                            }
                                        });
                                    }
                                }

                                if(createdProject){
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
                                }


                            })

                            // Update content and images
                            // if(repositoryID instanceof String && repoID instanceof String && userID instanceof String){
                            // }
                            const updateResponse = await updateContent(repositoryID, createdProject.id, user.id)

                            if (!updateResponse.success) {
                                const response: AddProjectResponse = {
                                    success: false,
                                    message: `Failed to add project content. ${updateResponse.message}`,
                                }
                                // Clean up any created project or repo
                                createdProject ? await deleteProject(createdProject.id):null
                                createdRepo ? await deleteRepo(createdRepo.id):null
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

                            const response: AddProjectResponse = {
                                success: false,
                                message: 'Missing required form fields: ' + missingFields.join(', '),
                            }
                            // Clean up any created project or repo
                            createdProject ? await deleteProject(createdProject.id):null
                            createdRepo ? await deleteRepo(createdRepo.id):null
                            return resolve({ code: 400, json: response });
                        }
                    });
                }catch(e){
                    console.log(e)
                    const response: AddProjectResponse = {
                        success: false,
                        message: 'Something went wrong during the file upload.',
                    }
                    return resolve({ code: 500, json: response });
                }
            });
            console.log("reponse")
            console.log(code, json)
            return res.status(code).json(json)
        } catch (error) {
            logger.warn(`Request threw an exception: ${error}`, {
                label: 'GET: /projects/:userid/count: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

export default projectsRouter;