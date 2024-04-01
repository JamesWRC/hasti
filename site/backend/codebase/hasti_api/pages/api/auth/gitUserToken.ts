import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { JWTResult, getGitHubUserToken, handleUserJWTPayload, updateGitHubUserToken } from '@/pages/helpers/user';

import { User } from '@prisma/client';
import prisma from '@/clients/prisma/client';


const AUTH_GITHUB_ID = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_ID : process.env.DEV_AUTH_GITHUB_ID;
const AUTH_GITHUB_SECRET = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_SECRET : process.env.DEV_AUTH_GITHUB_SECRET;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { code, installation_id } = req.body;

            const reqHeaders = req.headers;
            const token = reqHeaders.authorization?.replace('Bearer ', '') as string;
            try{
                const tokenResult:JWTResult<User, string> = await handleUserJWTPayload(token)
                if(!tokenResult.success){
                    return res.status(401).json({ message: tokenResult.message });
                }

                const user:User = tokenResult.user

                // Make a POST request to GitHub API to exchange the code and installation_id for a user token
                const headers = {
                    Accept: 'application/json',
                };

                const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
                    code,
                    installation_id,
                    client_id: AUTH_GITHUB_ID,
                    client_secret: AUTH_GITHUB_SECRET,
                }, { headers });

                if(!tokenResponse.data?.error){
                    // Extract the user token from the response
                    const userToken = tokenResponse.data.access_token;

                    // Save the user token in the database  
                    await updateGitHubUserToken(userToken, user);

                    const response = {
                        success: true,
                        message: 'User token saved'
                    }
                    // Return the user token as the API response
                    return res.status(200).json({ response });
                }else{
                    return res.status(400).json({ message: 'GitHub failed to get a token for the user' });
                }
            }catch(error){
                console.error('Error exchanging code and installation_id for user token1 :', error);
                res.status(401).json({ message: 'Unauthorized' });
            }

        } catch (error) {
            console.error('Error exchanging code and installation_id for user token 2:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }

    } else if (req.method === 'GET'){


        try{
            // get headers from request
            const headers = req.headers
            const token = headers.authorization?.replace('Bearer ', '') as string
            
            const tokenResult:JWTResult<User, string> = await handleUserJWTPayload(token)
            if(!tokenResult.success){
                return res.status(401).json({ message: tokenResult.message });
            }

            const user:User = tokenResult.user

            const encToken = await prisma.user.findUnique({
                where: {
                    id: user.id
                },
                select: {
                    ghuToken: true
                }
            })

            if(!encToken?.ghuToken){
                return res.status(401).json({ message: 'Failed to get token from database' });
            }

            const decryptedToken = await getGitHubUserToken(encToken.ghuToken)

            const tokenResponse = await axios.get('https://api.github.com',{
                headers: {
                    Authorization: `token ${decryptedToken}`
                }
            } );

            if (tokenResponse.status !== 200) {
                return res.status(401).json({ message: 'Bad token. Possibly failed to decrypt' });
            }
           
            return res.status(200).json({ token: decryptedToken });
        }catch(error){
            console.log(error)
            res.status(401).json({ message: 'Unauthorized' });
        }
        
    }else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}

