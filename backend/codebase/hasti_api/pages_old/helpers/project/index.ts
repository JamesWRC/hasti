import prisma from '@/backend/clients/prisma/client';
import markdownit from 'markdown-it'
import AWS from 'aws-sdk';

import { getGitHubUserToken } from "@/backend/pages_old/helpers/user";
import isNotString from "@/backend/pages_old/helpers";

export default async function updateContent(repoID: string, projectID: string, userID: string) {


    // Init s3
    const s3 = new AWS.S3({
        region: 'auto',
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        accessKeyId: process.env.CLOUDFLARE_BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_BUCKET_SECRET_KEY,
      });


    const token = "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"
    
    if (isNotString(repoID)) {
        return { success: false, message: "Invalid repo ID." }
    }

    if (isNotString(projectID)) {
        return { success: false, message: "Invalid project ID." }
    }

    if (isNotString(userID)) {
        return { success: false, message: "Invalid user ID." }
    }
    

    console.log("repoID", repoID)
    console.log(typeof repoID)
    console.log(repoID === null)
    console.log(repoID === undefined)

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
        },
        select: {
            ghuToken: true
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

    // Decrypt the user's token
    const decryptedToken = await getGitHubUserToken(user.ghuToken)

    let retVal = {
        success: false,
        message: ""
    }
    console.log(`https://api.github.com/repos/${repo.fullName}/contents/README.md`)
    // Fetch repos README.md file
    const response = await fetch(`https://api.github.com/repos/${repo.fullName}/contents/README.md?ref=test`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    console.log("response", response)

    if (!response.ok) {
        return retVal = { success: false, message: "Failed to fetch README.md file. May not exist at path or no access to repo." }
    }else if(response.status === 404){
        return retVal = { success: false, message: "README.md file not found." }
    }else{

        const data = await response.json();
        console.log("response data", data)

        const content = data.content;
        let decodedContent = Buffer.from(content, 'base64').toString('utf-8');

        const extractedContentImages: string[] = extractImageUrls(decodedContent);

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
        console.log("newContentImages", newContentImages)
        console.log("project.contentImages", project.contentImages)
        const imagesToDelete: string[] = project.contentImages.filter(image => !newContentImages.includes(image));
        const imagesToUpload: string[] = newContentImages.filter(image => !project.contentImages.includes(image));

        // Update the project's contentImages
        await prisma.project.update({
            where: {
                id: projectID
            },
            data: {
                contentImages: newContentImages,
                content: decodedContent

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


        // Upload new images to the Cloudflare R2 bucket
        for (const imageURL of extractedContentImages) {
            
            const {newImageURL, imagePath} = getNewImageURL(imageURL, userID, projectID);

            // download image
            const imageResponse = await fetch(imageURL);
            // Get the content type of the content
            const contentType:string = imageResponse.headers.get('content-type') ?? 'image/jpeg'

            if (!imageResponse.ok) {
                return { success: false, message: `Failed to download image: ${imageURL} status: ${response.statusText}`}

            }

            const imageBuffer = await imageResponse.arrayBuffer();

            // Set the parameters for the S3 upload
            const s3Params = {
                Bucket: process.env.CLOUDFLARE_BUCKET_NAME as string,
                Key: imagePath,
                Body: Buffer.from(imageBuffer),
                ContentType: contentType,
            };

            // Upload the image to the Cloudflare R2 bucket
            s3.upload(s3Params, (s3Err:any, data:any) => {
                if (s3Err) {
                    console.error('Error uploading to S3: ', s3Err);
                    return { success: false, message: "Error uploading to S3." }
                }
            });
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
    const md = markdownit();
    const tokens = md.parse(markdownContent, {});

    const mediaUrls: string[] = [];

    for (const token of tokens) {
        if (token.type === 'inline') {
            const line = token.content;
            const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'mp4', 'webm', 'mov']; // Add more extensions if needed
            
            // Extract image github media URLs. Don't want to abuse the GitHub content delivery network / use up their bandwidth.
            // Other sites can be added to the regex if needed. ATM it is assumed you have full rights to the content.
            const matches = line.match(/\bhttps?:\/\/user-images.githubusercontent.com\S+\.(jpg|jpeg|png|gif|svg|mp4|webm|mov)\b/gi);
            if (matches) {
                mediaUrls.push(...matches);
            }
            

        }
    }

    return mediaUrls;
}