import prisma from '@/backend/clients/prisma/client';
import markdownit from 'markdown-it'
import AWS from 'aws-sdk';

import { getGitHubUserToken } from "@/backend/helpers/user";
import isNotString from "@/backend/helpers";
import { Octokit } from "octokit";
import { getGitHubUserAuth } from "@/backend/helpers/auth/github";
import logger from "@/backend/logger";
import { OctokitResponse } from "@octokit/types";
import { User } from '@prisma/client';
import { AddProjectResponse } from '@/backend/interfaces/project/request';
import { Files } from 'formidable';
import { Project } from '@/backend/interfaces/project';
import { NotificationAbout, NotificationType } from '@/backend/interfaces/notification';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import cherrio from 'cheerio';
import fs from 'fs';
import { promises as fs_promise } from 'fs';

// Init s3
const s3 = new AWS.S3({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    accessKeyId: process.env.CLOUDFLARE_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_BUCKET_SECRET_KEY,
});

export async function updateContent(repoID: string, projectID: string, userID: string) {

    if (isNotString(repoID)) {
        return { success: false, message: "Invalid repo ID." }
    }

    if (isNotString(projectID)) {
        return { success: false, message: "Invalid project ID." }
    }

    if (isNotString(userID)) {
        return { success: false, message: "Invalid user ID." }
    }
    

    // get repo owner and name
    const repo = await prisma.repo.findUnique({
        where: {
           id: repoID as string
        },
        select: {
            fullName: true
        }
    })

    // get user's token 
    const user = await prisma.user.findUnique({
        where: {
            id: userID
        }
    })
    console.log("user", user)

    if (!user) {
        return { success: false, message: "User not found." }
    }

    if(!repo){
        return { success: false, message: "Repo not found." }
    }

    if(user.ghuToken.length <= 0){
        return { success: false, message: "User does not have a GitHub token." }
    }


    let retVal = {
        success: false,
        message: ""
    }

    const owner: string = repo.fullName.split('/')[0]
    const repoName: string = repo.fullName.split('/')[1]

    // Fetch repos readme file (can be any README.xx file)
    const gitHubUserAuth = await getGitHubUserAuth(user);
    const response = await gitHubUserAuth.request('GET /repos/{owner}/{repo}/readme', {
        owner: owner,
        repo: repoName
    });
    


    console.log("response", response)
    response.status
    if (response.status !== 200) {
        return retVal = { success: false, message: "Failed to fetch a README.md file. May not exist at path or no access to repo." }
    }else{


        let decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
        decodedContent = handleHTMLinMarkDown(decodedContent)
        console.log("---- decodedContent2", decodedContent)

        const extractedContentImages: string[] = extractImageUrls(decodedContent);
        console.log("extractedContentImages", extractedContentImages)
        // Get previous images from the project
        const project = await prisma.project.findUnique({
            where: {
                id: projectID
            },
            select: {
                contentImages: true
            }
        })

        if (!project){
            return { success: false, message: "Project not found." }
        }

        const newContentImages: string[] = []
        // If there are images in the project that are not in the new content, delete them

        for (const imageURL of extractedContentImages) {

            // Get the new image URL
            const {newImageURL, imagePath} = getNewImageURL(imageURL, userID, projectID);
            // Add the new image URL to the hastiImages array
            newContentImages.push(newImageURL)

            // Replace the image URL in the content
            decodedContent = decodedContent.replace(imageURL, newImageURL);

        }

        const imagesToDelete: string[] = project.contentImages.filter(image => !newContentImages.includes(image));
        const imagesToUpload: string[] = newContentImages.filter(image => !project.contentImages.includes(image));
        const contentSHA:string = response.data.sha;

        const contentDidSave:boolean = await writeFileAsync(`./temp/projects/${projectID}/${contentSHA}/content.md`, decodedContent)
        if(!contentDidSave){
            return retVal = { success: false, message: "Failed to fetch a README.md file. May not exist at path or no access to repo." }
        }
        // Update the project's contentImages
        await prisma.project.update({
            where: {
                id: projectID
            },
            data: {
                contentImages: newContentImages,
                contentSHA: contentSHA,
            }
        })


        console.log("imagesToDelete", imagesToDelete)
        // Delete images that are no longer in the project's content
        const deletePromises: Promise<any>[] = [];
        for (const imagePath of imagesToDelete) {
            // Delete the image from the Cloudflare R2 bucket
            deletePromises.push(s3.deleteObject({
                Bucket: process.env.CLOUDFLARE_BUCKET_NAME as string,
                Key: imagePath
            }).promise())
        }
        // Wait for all the images to be deleted
        await Promise.all(deletePromises);

        console.log("extractedContentImages", extractedContentImages)
        // Upload new images to the Cloudflare R2 bucket
        for (const imageURL of extractedContentImages) {
            
            try {
                const {newImageURL, imagePath} = getNewImageURL(imageURL, userID, projectID);

                // download image
                const imageResponse = await axios({
                    url: imageURL,
                    method: 'GET',
                    responseType: 'stream',
                    timeout: 10000,
                    timeoutErrorMessage: 'Request timed out. Please try again.',
                  });
                
                  console.log("imageResponse", imageResponse)
                // Get the content type of the content
                const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
            
                if (imageResponse.status !== 200) {
                    return { success: false, message: `Failed to download image: ${imageURL} status: ${imageResponse.status}` };
                }
            
               // Create a buffer to hold the image data
                const imageBuffer:Buffer = await new Promise((resolve, reject) => {
                    const chunks:any = [];
                    imageResponse.data.on('data', (chunk:any) => chunks.push(chunk));
                    imageResponse.data.on('end', () => resolve(Buffer.concat(chunks)));
                    imageResponse.data.on('error', (error:any) => reject(error));
                });
                // Set the parameters for the S3 upload
                const s3Params: AWS.S3.PutObjectRequest = {
                    Bucket: process.env.CLOUDFLARE_BUCKET_NAME as string,
                    Key: imagePath,
                    Body: imageBuffer,
                    ContentType: contentType,
                };

                // Upload the image to the Cloudflare R2 bucket
                s3.upload(s3Params, (s3Err , data) => {
                    if (s3Err) {
                        console.error('Error uploading to S3: ', s3Err);
                        return { success: false, message: "Error uploading to S3." }
                    }
                });
            
            } catch (error) {
                console.error('Error during Axios request: ', error);
                return { success: false, message: "Error during Axios request." };
            }
        }

        return retVal = { success: true, message: "Successfully updated project content." }
    }


}


function getNewImageURL(imageURL: string, userID: string, projectID: string): {newImageURL: string, imagePath: string}{
    // Split the image URL to get the image name
    const imageUrlParts = imageURL.split('/');
    // get image name from url
    const fileName = imageUrlParts.pop() as string;

    // Replace the image URL with the new URL
    const imagePath = `user/${userID}/${projectID}/${fileName}`
    const newImageURL = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${imagePath}`

    return {newImageURL: newImageURL, imagePath: imagePath}
}

// Function to extract image URLs from Markdown content
function extractImageUrls(markdownContent: string): string[] {
    console.log("markdownContent", markdownContent)
    const md = markdownit();
    const tokens = md.parse(markdownContent, {});

    const mediaUrls: string[] = [];

    for (const token of tokens) {
        if (token.type === 'inline') {
            const line = token.content;
            const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'mp4', 'webm', 'mov']; // Add more extensions if needed
            
            // Extract image github media URLs. Don't want to abuse the GitHub content delivery network / use up their bandwidth.
            // Other sites can be added to the regex if needed. ATM it is assumed you have full rights to the content.
            const gitHubUserImagesMatches = line.match(/\bhttps?:\/\/user-images.githubusercontent.com\S+\.(jpg|jpeg|png|gif|svg|mp4|webm|mov)\b/gi);
            const githubAssetMatches = line.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/(assets\/\d+\/[^\/]+)/gi);
            if (gitHubUserImagesMatches) {
                mediaUrls.push(...gitHubUserImagesMatches);
            }

            if (githubAssetMatches) {
                for (const githubAssetMatch of githubAssetMatches) {
                    mediaUrls.push(githubAssetMatch.replace(')', ''));
                }
            }
        }
    }

    return mediaUrls;
}

function replaceLastOccurrence(original: string, toReplace: string, replacement: string): string {
    const lastIndex = original.lastIndexOf(toReplace);
    if (lastIndex === -1) {
        return original; // Return original if the substring is not found
    }
    if (original.includes(replacement)) {
        return original; // Return original if the replacement is already present
    }

    // Split the string into two parts, before and after the substring
    const before = original.substring(0, lastIndex);
    const after = original.substring(lastIndex + toReplace.length);

    // Return the combined new string
    return before + replacement + after;
}


function handleHTMLinMarkDown(markdown: string) {


    function findHtmlBlocks(text: string): { block: string, start: number, end: number }[] {
        // Split text into lines to maintain line numbers
        const lines = text.split('\n');

        // Remove content within triple backtick code blocks
        let inCodeBlock = false;
        const filteredLines = lines.map((line, index) => {
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock; // Toggle state on entering or leaving a code block
                return ''; // Remove code block markers
            }
            return inCodeBlock ? '' : line;
        });

        const filteredText = filteredLines.join('\n');
        const regex = /<(\w+)(?:\s+[^>]*)?>([\s\S]*?)<\/\1>/g;

        let match;
        const blocks = [];
        while ((match = regex.exec(filteredText)) !== null) {
            // Calculate start and end lines based on the match index
            const startLine = filteredText.substring(0, match.index).split('\n').length;
            const endLine = startLine + match[0].split('\n').length - 1;

            blocks.push({
                block: match[0],
                start: startLine,
                end: endLine
            });
        }

        return blocks;
    }

    const dom = new JSDOM(markdown, { contentType: 'text/html', });
    let document = dom.window.document;
    // if the markdown has safeHTML tags, return the markdown as is
    
    if(document.body.innerHTML.includes('{% safeHTML %}')){
        return markdown
    }

    const blocks = findHtmlBlocks(document.body.innerHTML)
    
    // convertHtmlToMarkdoc(document.body);
    // console.log("blocks", blocks)
    // console.log("document AFTER", document.body.innerHTML)
    let docLines = document.body.innerHTML.split('\n')
    // console.log("docLines BEFORE", docLines.length)

    // Define an array of self-closing tags
    const selfClosingTags = ['br', 'img', 'input', 'hr', 'meta', 'link'];
    const $ = cherrio.load(document.body.innerHTML);

    // Extract all self-closing tags
    const tags = selfClosingTags.map(tag => {
    return $(tag).map((i, el) => ({
        tag: tag,
        html: $.html(el) // get outer HTML of each tag
    })).get();
    }).flat();

    let tagsIndex = 0
    for (const block of blocks) {
        const blockContent = block.block;

        const blockStart = block.start - 1; // Adjust for 0-based index
        let blockEnd = block.end - 1;

        // get the starting tag of the block
        const startTag = docLines[blockStart].match(/<([a-z1-6]+)([^>]*)>/i);
        const startTagName = startTag ? startTag[1] : '';
        // console.log("startTagName", startTagName)

        // console.log("-------------------------------------")

        // console.log("docLines[blockStart]", docLines[blockStart])
        // console.log("docLines[blockEnd]", docLines[blockEnd])

        if (blockStart === blockEnd) {
            docLines[blockStart] = docLines[blockStart].replace(blockContent, ' {% safeHTML %} ' + blockContent + ' {% /safeHTML %} ')
        }else{
            docLines[blockStart] = docLines[blockStart].replace(blockContent[0], '{% safeHTML %} ' + blockContent[0])
            // console.log("blockContent[blockContent.length -1 ]", blockContent[blockContent.length -1 ])
            docLines[blockEnd] = replaceLastOccurrence(docLines[blockEnd], '</' + startTagName + '>', '</' + startTagName + '>{% /safeHTML %}')
            docLines[blockEnd] = replaceLastOccurrence(docLines[blockEnd], '</ ' + startTagName + '>', '</' + startTagName + '>{% /safeHTML %}')
            docLines[blockEnd] = replaceLastOccurrence(docLines[blockEnd], '</ ' + startTagName + ' >', '</' + startTagName + '>{% /safeHTML %}')
            docLines[blockEnd] = replaceLastOccurrence(docLines[blockEnd], '</' + startTagName + ' >', '</' + startTagName + '>{% /safeHTML %}')
        }


        // console.log("blockContent", block)
        // console.log("docLines[blockStart]", docLines[blockStart])
        // console.log("docLines[blockEnd]", docLines[blockEnd])
    }
    // console.log("tags", tags)
    for(const tag of tags){
        // if(!isSubStringFoundBetween(tag.html, '{% safeHTML %}', '{% /safeHTML %}', document.body.innerHTML)){
        //     console.log("tag.html", tag.html)
            docLines.find((line, index) => {
                if(line.includes(tag.html)){
                    let tagInBlock = false;
                    for (const block of blocks) {
                        const blockContent = block.block;
                
                        const blockStart = block.start - 1; // Adjust for 0-based index
                        let blockEnd = block.end - 1;
                
                        if(index >= blockStart && index <= blockEnd){
                            tagInBlock = true
                        }
                    }
                    if(!tagInBlock){
                        docLines[index] = '{% safeHTML %}\n' + tag.html + '\n{% /safeHTML %}'
                    }
                }
            })
        // }
    }

    
    // remove blank lines between safeHTML tags
    let remove = false
    for (let i = 0; i < docLines.length; i++) {
        if (docLines[i].includes('{% safeHTML %}')) {
            remove = true
        }

        if (docLines[i].includes('{% /safeHTML %}')) {
            remove = false
        }
        // console.log("docLines[i].trim()", docLines[i].trim(), docLines[i].trim().length)
        if (remove && docLines[i].trim().length === 0) {
            // console.log("removing", docLines[i])
            docLines.splice(i, 1);
            // console.log("removed", docLines[i])

        }
    }

    const modifiedHTML = docLines.join('\n');



    // console.log("docLines after", tags)

    return modifiedHTML
}

export async function getGitHubRepoData(user: User, owner: string, repo: string): Promise<OctokitResponse<any, number> | null> {

    try {
        const gitHubUserAuth = await getGitHubUserAuth(user);
        console.log("gitHubUserAuth", gitHubUserAuth)
        console.log("gitHubUserAuth user", user)
        console.log("gitHubUserAuth owner", owner)
        console.log("gitHubUserAuth repo", repo)
        const resp = await gitHubUserAuth.request('GET /repos/{owner}/{repo}', {
            owner: owner,
            repo: repo
        });
        return resp
    } catch (error) {
        logger.error(`Error getting repo data: ${error}`);
        return null;
    }
}

export async function deleteProject(projectID: string){
    await prisma.project.delete({
        where: {
            id: projectID
        }
    })
}

export default function isValidProjectName(name: string): boolean {
    const regex = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*(_[a-zA-Z0-9]+)*$/;
    return regex.test(name);
}

export function handleInvalidFiles(files: Files): {code: number, json: AddProjectResponse} {
    // Get file Size too large error
    const okFiles = Object.keys(files).map((fieldName:string) => {
        const file = files[fieldName as string];
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

    return {code: 413, json: response}
}


export async function handleProjectImages(files: Files, project: Project|null, user: User): Promise<{ code: number, json: AddProjectResponse }>{
    Object.keys(files).map(async (fieldName) => {
        const file = files[fieldName];

        if (file && project) {

            const filePath = file[0].filepath
            const fileName = file[0].originalFilename
            const readStream = fs.createReadStream(filePath);

            const fileUploadPath = `user/${user.id}/${project.id}/${fileName}`

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
                    return { code: 500, json: response };
                }
            });

            // Save the file path to the project for image content
            if (fieldName === 'iconImage') {
                // Delete the previous icon image
                if (project.iconImage) {
                    s3.deleteObject({
                        Bucket: process.env.CLOUDFLARE_BUCKET_NAME as string,
                        Key: decodeURIComponent(project.iconImage)
                    }, (err, data) => {
                        if (err) {
                            console.error('Error deleting previous icon image: ', err);
                        }
                    });
                }

                await prisma.project.update({
                    where: { id: project.id },
                    data: {
                        iconImage: encodeURIComponent(fileUploadPath)
                    }
                });
            } else if (fieldName === 'backgroundImage') {
                // Delete the previous background image
                if (project.backgroundImage) {
                    s3.deleteObject({
                        Bucket: process.env.CLOUDFLARE_BUCKET_NAME as string,
                        Key: decodeURIComponent(project.backgroundImage)
                    }, (err, data) => {
                        if (err) {
                            console.error('Error deleting previous background image: ', err);
                        }
                    });
                }

                await prisma.project.update({
                    where: { id: project.id },
                    data: {
                        backgroundImage: encodeURIComponent(fileUploadPath)
                    }
                });
            }
        }
        })
    return { code: 200, json: { success: true, message: 'Project images handled successfully' } };

}


export async function readFileIfExists(filePath: string): Promise<string | null> {
    try {
        // If the file exists, read and return its contents
        const data = await fs_promise.readFile(filePath, "utf-8");
        return data;
    } catch (error) {
        // Handle the error (file not found or other errors)
        console.error("Error accessing or reading file:", error);
        return null;
    }
}


export async function writeFileAsync(filePath: string, data: string): Promise<boolean> {
    try {

        const dir = require('path').dirname(filePath);

        await fs_promise.mkdir(dir, { recursive: true });

        // Write data to file asynchronously
        await fs_promise.writeFile(filePath, data, "utf-8");
        return true
    } catch (error) {
        // Handle potential errors
        console.error('Failed to write to file:', error);
        return false
    }
}

export function stringToBase64(inputString:string): string {
    // Create a buffer from the string
    const buffer = Buffer.from(inputString, 'utf8');

    // Convert the buffer to Base64
    const base64String = buffer.toString('base64');

    return base64String;
}