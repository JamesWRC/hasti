import { Router } from 'express';
import { JWTBodyRequest, JWTBodyResponse, UserRepoCountResponse, UserReposResponse } from '@/backend/interfaces/user/request';
import { UserType, getUserType, type User, type UserJWT, type UserJWTPayload } from '@/backend/interfaces/user';
// import { JWTResult, handleUserJWTPayload } from '@/backend/helpers/user';
import { BadRequestResponse, OkResponse } from '@/backend/interfaces/request';
import prisma from '@/backend/clients/prisma/client';

import logger from '@/backend/logger';
import { Repo } from '@/backend/interfaces/repo';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import addOrUpdateUser, { getGitHubUserToken, updateGitHubUserToken } from '@/backend/helpers/user';
import axios from 'axios';
import { isAuthenticated } from '@/backend/helpers/auth';
import { AuthCheckType, CheckAuthResponse, ReAuthenticateUserResponse } from '@/backend/interfaces/auth/index';
import { constructUserOctoKitAuth } from '@/backend/helpers/auth/github';

const authRouter = Router();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string


/**
 * ONLY used for internal use. Used to get the users ghuToken to make requests on their behalf.
 */
authRouter.get<Record<string, string>, string | BadRequestResponse>(
    '/getGhuToken',
    async (req, res) => {
        try {
            // get headers from request
            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            }
            const ghuTokenEnc: string = user.ghuToken

            res.status(200).json({ success: true, message: "Not implemented yet" });
        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'GET: /auth/getGhuToken: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

/**
 * Create a JWT token for the user. Used at login / signup.
 */
authRouter.post<Record<string, string>, JWTBodyResponse | BadRequestResponse>(
    '/jwt',
    async (req, res) => {
        try {
            // get body from request
            const body: JWTBodyRequest = await req.body
            let response: JWTBodyResponse = {
                success: false,
                jwt: '',
                id: '',
                type: UserType.USER // Default to user
            }

            const ghu_token: string = body.user.ghu_token
            // Check if the ghu_token is valid
            if (!ghu_token || ghu_token.length <= 0 || !ghu_token.startsWith('ghu_')) {
                return res.status(400).json({ success: false, message: 'No ghu_token provided. Or is not valid' });
            }

            // If the token is valid
            const gitHubUserRequest = await constructUserOctoKitAuth(ghu_token)
            logger.info('ghu_token 1', ghu_token)

            // Check if the token is valid.
            gitHubUserRequest.request("GET /users/{username}", {
                username: body.user.username
            }).catch((e: any) => {
                logger.warn(`Error testing user auth: ${e}`)
                return res.status(400).json({ success: false, message: 'Error testing user auth' });
            });

            logger.info('ghu_token 2', ghu_token)

            const user: User | null = await addOrUpdateUser(body)
            if (user) {
                const user_type: UserType = getUserType(user.type)

                logger.info('user', user)
                // Create JWT payload
                const payload: UserJWTPayload = {
                    provider: body.provider,
                    user: {
                        id: user.id,
                        name: body.user.name,
                        username: body.user.username,
                        image: body.user.image,
                        githubID: user.githubID,
                        type: user_type
                    },
                }


                // var token = jwt.sign(body, JWT_SECRET__KEY, { expiresIn: 31556926 });
                const iat = Math.floor(Date.now() / 1000);
                const exp = iat + 60 * 60 * 24 * 32 * 12; // one year

                const token = await new SignJWT({ payload })
                    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
                    .setExpirationTime(exp)
                    .setIssuedAt(iat)
                    .setNotBefore(iat)
                    .sign(new TextEncoder().encode(JWT_SECRET_KEY));

                /* Send success with token */
                response = {
                    success: true,
                    jwt: token,
                    id: user.id,
                    type: user_type
                }
                return res.status(200).json(response);

            }
        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'POST: /auth/v1/jwt: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });

    authRouter.post<Record<string, string>, ReAuthenticateUserResponse | BadRequestResponse>(
        '/reAuth',
        isAuthenticated,
        async (req, res) => {
            try {
                // get jwt header from request
                const jwt: string = req.headers.authorization as string;


                const user: User | undefined = req.user;

                if (!user || !jwt) {
                    return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.'});
                }

                return res.status(200).json({ success: true, user: user, jwt:jwt, check: AuthCheckType.ALL_OK });
    
    
            } catch (error) {
                logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                    label: 'GET: /auth/gitUserToken: ',
                });
                return res.status(500).json({ success: false, message: 'Error getting token' });
            }
        });

// ############################################################################################################
// ###############                                                                              ###############
// ###############                             GitHub based API calls                           ###############
// ###############                                                                              ###############
// ############################################################################################################

authRouter.get<Record<string, string>, CheckAuthResponse | BadRequestResponse>(
    '/gitUserToken',
    isAuthenticated,
    async (req, res) => {
        try {
            // get headers from request
            const user: User | undefined = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.', check: AuthCheckType.USER_OK });
            }

            const encToken = await prisma.user.findUnique({
                where: {
                    id: user.id
                },
                select: {
                    ghuToken: true
                }
            })

            if (!encToken?.ghuToken) {
                return res.status(401).json({ success: false, message: 'Failed to get token from database', check: AuthCheckType.TOKEN_EXIST });
            }

            const decryptedToken = await getGitHubUserToken(encToken.ghuToken)

            const tokenResponse = await axios.get('https://api.github.com', {
                headers: {
                    Authorization: `token ${decryptedToken}`
                }
            });

            if (tokenResponse.status !== 200) {
                return res.status(401).json({ success: false, message: 'Bad token. Possibly failed to decrypt', check: AuthCheckType.DECRYPT });
            }

            return res.status(200).json({ success: true, message: 'User token ok, all checks passed.', check: AuthCheckType.ALL_OK });


        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'GET: /auth/gitUserToken: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });


authRouter.post<Record<string, string>, OkResponse | BadRequestResponse>(
    '/gitUserToken',
    isAuthenticated,
    async (req, res) => {
        try {
            const { code, installation_id } = req.body;

            try {


                const user: User | undefined = req.user;
                if (!user) {
                    return res.status(401).json({ success: false, message: 'Unauthorized' });
                }

                // Make a POST request to GitHub API to exchange the code and installation_id for a user token
                const headers = {
                    Accept: 'application/json',
                };

                const AUTH_GITHUB_ID = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_ID : process.env.DEV_AUTH_GITHUB_ID;
                const AUTH_GITHUB_SECRET = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_SECRET : process.env.DEV_AUTH_GITHUB_SECRET;

                const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
                    code,
                    installation_id,
                    client_id: AUTH_GITHUB_ID,
                    client_secret: AUTH_GITHUB_SECRET,
                }, { headers });

                if (!tokenResponse.data?.error) {
                    // Extract the user token from the response
                    const userToken = tokenResponse.data.access_token;

                    // Save the user token in the database  
                    await updateGitHubUserToken(userToken, user);

                    // Return the user token as the API response
                    return res.status(200).json({ success: true, message: 'User token saved' });
                } else {
                    return res.status(400).json({ success: false, message: 'GitHub failed to get a token for the user' });
                }
            } catch (error) {
                console.error('Error exchanging code and installation_id for user token1 :', error);
                res.status(401).json({ success: false, message: 'Unauthorized' });
            }


        } catch (error) {
            logger.warn(`Request threw an exception: ${(error as Error).message} - ${(error as Error).stack}`, {
                label: 'POST: /auth/gitUserToken: ',
            });
            return res.status(500).json({ success: false, message: 'Error getting token' });
        }
    });




export default authRouter;