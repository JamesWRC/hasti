import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { updateGitHubUserToken } from '@/pages/helpers/user';
import jwt from 'jsonwebtoken';


const JWT_SECRET__KEY = process.env.JWT_SECRET_KEY as string


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { code, installation_id } = req.body;

            const reqHeaders = req.headers;
            const token = reqHeaders.authorization?.replace('Bearer ', '') as string;

            jwt.verify(token, JWT_SECRET__KEY, (err: any, decoded: any) => {
                if (err) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                // console.log('decoded', decoded)
                res.status(200).json({ message: 'GET request' });
            });

            const headers = {
                Accept: 'application/json',
            };

            // Make a POST request to GitHub API to exchange the code and installation_id for a user token
            console.log({
                code,
                installation_id,
                client_id: process.env.AUTH_GITHUB_ID,
                client_secret: process.env.AUTH_GITHUB_SECRET,
            })
            const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
                code,
                installation_id,
                client_id: process.env.AUTH_GITHUB_ID,
                client_secret: process.env.AUTH_GITHUB_SECRET,
            }, { headers });

            console.log('response', tokenResponse.data);

            // Extract the user token from the response
            const userToken = tokenResponse.data.access_token;

            // Save the user token in the database  
            await updateGitHubUserToken(userToken, installation_id);

            const response = {
                success: true,
                
            }
            // Return the user token as the API response
            res.status(200).json({ userToken });
        } catch (error) {
            console.error('Error exchanging code and installation_id for user token:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else if (req.method === 'OPTIONS') {
        // provide preflight response with headers
        res.status(200).end();
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}

