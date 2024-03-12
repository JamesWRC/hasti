import { GitHubAddRepoRequest } from '@/interfaces/repo';
import { addOrUpdateRepo, removeRepo } from '@/pages/helpers/repo';
import prisma from '@/clients/prisma/client';
import { User } from '@prisma/client';
import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';



export const dynamic = 'force-dynamic'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Verify the request is coming from GitHub
        const signature = req.headers['x-hub-signature'] as string;
        const event = req.headers['x-github-event'] as string;

        const payload = req.body as GitHubAddRepoRequest;
        const action = payload.action;
        console.log('signature', signature)
        console.log('event', event)
        // console.log('body', payload)

        // Verify the signature and event type
        if (verifySignature(signature, payload)) {

            const GitHubUserID = payload.installation.account.id;
            const GitHubUsername = payload.installation.account.login;
            console.log('GitHubUserID', GitHubUserID)
            const user: User|null = await prisma.user.findUnique({
                where: {
                    githubID: GitHubUserID
                }
            })
            console.log('user', user)

            if(user){
                console.log('user', user)
                if(event === 'installation_repositories'){
                    console.log('event', event)
                    console.log('action', action)
                    // Add repos
                    if(action === 'added'){
                        console.log('payload.repositoriesAdded', payload.repositories_added)

                        for (const repo of payload.repositories_added) {
                            console.log('add repo', repo)    
                            await addOrUpdateRepo(repo, user)
                        }
                    }
                    // Remove repos 
                    if(action === 'removed'){
                        for (const repo of payload.repositories_removed) {
                            console.log('del repo', repo)
                            await removeRepo(repo)
                        }
                    }
                }

            }else{
                res.status(400).json({ message: 'User not found' });
            }
                 

            

            // Send a success response
            res.status(200).json({ message: 'Webhook received successfully' });
        } else {
            // Invalid signature or event type
            res.status(400).json({ message: 'Invalid webhook request' });
        }
    } else {
        // Only accept POST requests
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

function verifySignature(signature: string, body: any): boolean {
    
    const GITHUB_APP_WEBHOOK_SECRET = process.env.GITHUB_APP_WEBHOOK_SECRET as string;
    const hmac = crypto.createHmac('sha1', GITHUB_APP_WEBHOOK_SECRET);
    const calculatedSignature = `sha1=${hmac.update(JSON.stringify(body)).digest('hex')}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature));

}