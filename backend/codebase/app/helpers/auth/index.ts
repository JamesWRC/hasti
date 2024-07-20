import { User, UserJWT } from '@/backend/interfaces/user';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { jwtVerify } from "jose";
import prisma from "@/backend/clients/prisma/client";
import { Request, Response, NextFunction } from 'express';
import { CorsOptions } from 'cors';
    
const algorithm = 'aes-256-cbc';
// Generate a secure, random key
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY
if(DB_ENCRYPTION_KEY === undefined){
    throw new Error('DB_ENCRYPTION_KEY is undefined')
}

const key = Buffer.from(DB_ENCRYPTION_KEY, 'utf-8');
// Generate an initialization vector

const JWT_SECRET__KEY = process.env.JWT_SECRET_KEY as string


    export function encrypt(text: string): string {
        console.log('begin decrypt')

        const iv = randomBytes(16);
        console.log('iv:', iv)
        const cipher = createCipheriv(algorithm, key, iv);
        console.log('cipher:', cipher)

        let encrypted = cipher.update(text, 'utf8', 'hex');
        console.log('encrypted:', encrypted)

        encrypted += cipher.final('hex');
        console.log('encrypted 2 :', encrypted)

        // Return the iv and the encrypted message
        const encryptedMessage = iv.toString('hex') + encrypted;
        console.log('encryptedMessage:', encryptedMessage)

        return encryptedMessage;
    }
    
    export function decrypt(encryptedText: string): string {
        // Extract the iv and the encrypted message
        const receivedIv = Buffer.from(encryptedText.slice(0, 32), 'hex');
        const receivedCiphertext = encryptedText.slice(32);
    
        // Create a decipher object
        const decipher = createDecipheriv(algorithm, key, receivedIv);
        let decrypted = decipher.update(receivedCiphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    
    /**
     * Excludes the 'ghuToken' from the user.
     *
     * @returns {User} - Returns User without the 'ghuToken'
     */
    function excludeGHUToken<User, Key extends keyof User>(
        user: User,
        keys: Key[]
    ): Omit<User, Key> {
        const filteredEntries = Object.entries(user as {[key: string]: unknown}).filter(
            ([key]) => !keys.includes(key as Key)
        );
    
        return Object.fromEntries(filteredEntries) as Omit<User, Key>;
    }
    
    

export type JWTResult<T, E> = { success: true; user: User } | { success: false; message: string };
export async function handleUserJWTPayload(token: string): Promise<JWTResult<User, string>>{
    try{
        const payload:UserJWT = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET__KEY));
        const user:User|null = await prisma.user.findUnique({
                where: {
                        id: payload.payload.payload.user.id
                }
        })
        if (!user) {
                return { success: false, message: 'Unauthorized. Bad user.' };
        }

        // Return the user token as the API response
        return { success: true, user: user };
    }catch(error){
        console.error('Error getting token:', error);
        return { success: false, message: 'failed to decode JWT' };
    }
}

export const isAuthenticated: Middleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const reqHeaders = req.headers;
        const token = reqHeaders.authorization?.replace('Bearer ', '')
        let tokenResult: JWTResult<User, string> = { success: false, message: 'Unauthorized. No token provided.' };
        if(token){
            // const token = reqHeaders.authorization?.replace('Bearer ', '') as string;
            tokenResult = await handleUserJWTPayload(token)
        }else{
            res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
            return;
        }


        if (!tokenResult.success) {
            res.status(401).json({ success: false, message: tokenResult.message });
            return;
        }

        // Check if user is valid
        if (tokenResult.success && tokenResult.user) {
                req.user = tokenResult.user;
                next();
        }
    };
