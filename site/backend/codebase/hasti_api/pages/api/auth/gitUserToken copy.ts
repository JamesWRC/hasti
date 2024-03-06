import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getGitHubUserToken, updateGitHubUserToken } from '@/pages/helpers/user';
import { UserJWT } from '@/interfaces/user';
import { jwtVerify } from 'jose';
import prisma from '@/prisma/client';
import { User } from '@prisma/client';


const JWT_SECRET__KEY = process.env.JWT_SECRET_KEY as string


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { code, installation_id } = req.body;

            const reqHeaders = req.headers;
            const token = reqHeaders.authorization?.replace('Bearer ', '') as string;
            try{
                const payload:UserJWT = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET__KEY));
                const user:User|null = await prisma.user.findUnique({
                    where: {
                        id: payload.payload.payload.user.id
                    }
                })
                console.log('user', user)
                if (!user) {
                    return res.status(401).json({ message: 'Unauthorized. Bad user.' });
                }

                // Make a POST request to GitHub API to exchange the code and installation_id for a user token
                const headers = {
                    Accept: 'application/json',
                };

                const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
                    code,
                    installation_id,
                    client_id: process.env.AUTH_GITHUB_ID,
                    client_secret: process.env.AUTH_GITHUB_SECRET,
                }, { headers });

                console.log('tokenResponse.status', tokenResponse)
                if(tokenResponse.status === 200){

                    // Extract the user token from the response
                    const userToken = tokenResponse.data.access_token;
                    // const userToken = 'ghu_6K4KFY0vQkGEvu6EtJa22rrhEAav9k4Hjakr'
                    // Save the user token in the database  
                    await updateGitHubUserToken(userToken, user);
                    
                    const response = {
                        success: true,
                    }
                    // Return the user token as the API response
                    res.status(200).json({ response });

                }
            }catch(error){
                console.error('Error exchanging code and installation_id for user token1:', error);
                res.status(401).json({ message: 'Unauthorized' });
            }
        } catch (error) {
            console.error('Error exchanging code and installation_id for user token2:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else if (req.method === 'GET'){

        
    }else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}

