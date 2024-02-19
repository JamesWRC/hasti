

import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt"
import { decode } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';
import { headers } from 'next/dist/client/components/headers';
import { rem } from '@mantine/core';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {

        // get headers from request
        const headers = req.headers
        const token = headers.authorization?.replace('Bearer ', '')

        console.log('headers', token)
        await jwt.verify(token, 'test', (err: any, decoded: any) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            console.log('decoded', decoded)
            res.status(200).json({ message: 'GET request handled 2' });
        });
        // Handle GET request
        // res.status(200).json({ message: 'GET request handled' });
    } else if (req.method === 'POST') {

        // get body from request
        const body = req.body
        console.log('body', body)
        const payload = {
            id: 1,
            name: 'John Doe',
            email: 'a@a.com',
            };
        const KEY = 'test';
        let token = ''
        await jwt.sign(
                payload,
                KEY,
                {
                    expiresIn: 31556926, // 1 year in seconds
                },
                (err: any, token: string) => {
                    /* Send succes with token */
                    token = token
                    res.status(200).json({
                        success: true,
                        token: 'Bearer ' + token,
                    });
                },
            );
        console.log('token', token)

        // res.status(200).json({ message: 'POST request handled' });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}