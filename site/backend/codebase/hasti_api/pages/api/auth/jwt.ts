

import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt"
import { decode } from 'next-auth/jwt';
// import jwt from 'jsonwebtoken';

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';


import { JWTBodyRequest, JWTBodyResponse } from '@/interfaces/user/requests';
import type { UserJWT, UserJWTPayload } from '@/interfaces/user';
import prisma from '@/prisma/client';
import { addOrUpdateUser } from '@/pages/helpers/user';
import { User } from '@prisma/client';

const JWT_SECRET__KEY = process.env.JWT_SECRET_KEY as string

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {

        // get headers from request
        const headers = req.headers
        const token = headers.authorization?.replace('Bearer ', '') as string

        // Get body from request
        // console.log('headers', token)
        // jwt.verify(token, JWT_SECRET__KEY, (err: any, decoded: any) => {
        //     if (err) {
        //         return res.status(401).json({ message: 'Unauthorized' });
        //     }
        //     // console.log('decoded', decoded)
        //     res.status(200).json({ message: 'GET request' });
        // });
        // Handle GET request
        // res.status(200).json({ message: 'GET request handled' });
        try{
            const payload:UserJWT = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET__KEY));

            const ghuTokenEnc = await prisma.user.findUnique({
                where: {
                    id: payload.payload.payload.user.id
                },
                select: {
                    ghuToken: true
                }
            })
            console.log("ghuTokenEnc", ghuTokenEnc)
            res.status(200).json({ message: payload.payload });
        }catch(error){
            res.status(401).json({ message: 'Unauthorized' });
        }

    } else if (req.method === 'POST') {

        // get body from request
        const body:JWTBodyRequest = await req.body
        let response:JWTBodyResponse = {
            success: false,
            jwt: '',
            id: ''
        }
        
        console.log('body', body)

        const user:User|null = await addOrUpdateUser(body)

        if(user){
            console.log('user', user)
            // Create JWT payload
            const payload:UserJWTPayload = {
                provider: body.provider,
                user: {
                    id: user.id,
                    name: body.user.name,
                    username: body.user.username,
                    image: body.user.image,
                    githubID: user.githubID

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
                .sign(new TextEncoder().encode(JWT_SECRET__KEY));

            /* Send success with token */
            response = {
                success: true,
                jwt: token,
                id: user.id
            }
            return res.status(200).json(response);
        
        }
        return res.status(500).json({ message: 'Internal Server Error. User failed to be created / found.' });

    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}