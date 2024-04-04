import { UserProjectsResponse } from '@/interfaces/user/requests';
import { JWTResult, handleUserJWTPayload } from '@/pages/helpers/user';
import prisma from '@/clients/prisma/client';
import { Project, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import * as formidable from 'formidable';

import { PutObjectCommand, S3, S3Client } from "@aws-sdk/client-s3";
import AWS from 'aws-sdk';

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from 'fs';
import { AddProjectResponse } from '@/interfaces/project/request';
import { NotificationAbout, NotificationType } from '@/interfaces/notification';
import { updateContent } from '@/pages/helpers/project';

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

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const options: formidable.Options = {
                maxFileSize: MAX_FILE_SIZE,
                keepExtensions: true,
              };
            
            const reqHeaders = req.headers;
            console.log('reqHeaders', reqHeaders)
            const token = reqHeaders.authorization?.replace('Bearer ', '') as string;
            const tokenResult:JWTResult<User, string> = await handleUserJWTPayload(token)

            if(!tokenResult.success){
                return res.status(401).json({ message: tokenResult.message });
            }

            const user:User = tokenResult.user

            // Authorize the user before handling any files.
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized. Bad user.' });
            }
            try{
                const form = new formidable.IncomingForm(options);

                const { code, json } = await new Promise<{ code: any, json: any }>((resolve, reject) => {

                    form.parse(req, async (err, fields, files) => {
                        if (err) {

                            // File size too large code
                            if(err.code === 1009){
                                // console.log(err)
                                // Gte file Size too large error
                                const okFiles = Object.keys(files).map((fieldName) => {
                                    const file = files[fieldName];
                                    if(file){
                                        console.log(file)
                                        return fieldName
                                    }   
                                })
                                const response:AddProjectResponse = {
                                    success: false,
                                    message: 'File size too large. Max File Size: 10MB.',
                                }
                                console.log("okFiles", okFiles)
                                if(okFiles.length > 0){
                                    response.extraInfo = 'File fields OK: ' + okFiles.join(', ')
                                }

                                return resolve({code: 413, json: response});
        
                            }

                            // code: 1009,
                            // httpCode: 413
                            const response:AddProjectResponse = {
                                success: false,
                                message: 'Something went wrong during the file upload.',
                            }
                            return reject({code: 500, json: response});
                        }
                        
                        // Get form fields
                        const repositoryID:string|null = fields.repositoryID ? fields.repositoryID[0] : null;
                        const projectType:string|null = fields.projectType ? fields.projectType[0] : null;
                        const haInstallType:string|null = fields.haInstallType ? fields.haInstallType[0] : null;
                        const title:string|null = fields.name ? fields.name[0] : null; // The name becomes the title
                        const description:string|null = fields.description ? fields.description[0] : null;
                        const tags:string|null = fields.tags ? fields.tags[0] : null;
                        
                        console.log(repositoryID, projectType, haInstallType, title, description, tags)
        
                        if(repositoryID && projectType && haInstallType && title && description && tags){
                            // Split the tags into an array and remove any empty tags
                            const tagArray = tags.split(',').filter((tag) => tag.trim() !== '');
        
                            const addProject:Project = await prisma.project.create({
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
                                    userID: user.id,
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
                                
                                if(file){    
                                    
                                    const filePath = file[0].filepath
                                    const fileName = file[0].originalFilename
                                    const readStream = fs.createReadStream(filePath);
                                    
                                    const fileUploadPath = `user/${user.id}/${addProject.id}/${fileName}`
        
                                    const s3Params = {
                                        Bucket: process.env.CLOUDFLARE_BUCKET_NAME as string,
                                        Key: fileUploadPath,
                                        ContentType: file[0].mimetype ?? 'image/jpeg',
                                        Body: readStream,
                                    };
                                    
                                    // upload the file to the S3 (R2) bucket
                                    s3.upload(s3Params, (s3Err:any, data:any) => {
                                        if (s3Err) {
                                            console.error('Error uploading to S3: ', s3Err);
        
                                            const response:AddProjectResponse = {
                                                success: false,
                                                message: 'Something went wrong during the file upload.',
                                            }   
                                            return reject({code: 500, json: response});
                                        }
                                    });
        
                                    // Save the file path to the project for image content
                                    if(fieldName === 'profileImage'){
                                        await prisma.project.update({
                                            where: { id: addProject.id },
                                            data: {
                                                profileImage: fileUploadPath
                                            }
                                        });
                                    }else if(fieldName === 'backgroundImage'){
                                        await prisma.project.update({
                                            where: { id: addProject.id },
                                            data: {
                                                backgroundImage: fileUploadPath
                                            }
                                        });
                                    }
                                }

                            
                                await prisma.notification.create({
                                    data: {
                                        type: NotificationType.SUCCESS,
                                        title: addProject.title,
                                        message: `Project added`,
                                        about: NotificationAbout.PROJECT,
                                        read: false,

                                        userID: user.id,

                                    }
                                });

                            })

                            // Update content and images
                            const updateResponse = await updateContent(repositoryID, addProject.id, user.id)

                            if (!updateResponse.success) {
                                const response:AddProjectResponse = {
                                    success: false,
                                    message: `Failed to add project content. ${updateResponse.message}`,
                                }   
                                return reject({code: 500, json: response});
                            }else{
                                const response:AddProjectResponse = {
                                    success: true,
                                    message: 'Project added successfully',
                                    project: addProject,
                                } 

                                return resolve({code: 200, json: response});

                            }
                        }else{
                            const missingFields = [];
                            if(!repositoryID) missingFields.push('repositoryID');
                            if(!projectType) missingFields.push('projectType');
                            if(!haInstallType) missingFields.push('haInstallType');
                            if(!title) missingFields.push('name');
                            if(!description) missingFields.push('description');
                            if(!tags) missingFields.push('tags');
        
                            const response:AddProjectResponse = {
                                success: false,
                                message: 'Missing required form fields: ' + missingFields.join(', '),
                            }   
                            return reject({code: 400, json: response});
                        }
                    });
                    
                    
                });
                console.log("reponse")
                console.log(code, json)
                return res.status(code).json(json)

            }catch(e){
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        
    }else{
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
};



