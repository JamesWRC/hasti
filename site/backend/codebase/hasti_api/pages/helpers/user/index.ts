import { UserJWT } from "@/interfaces/user";
import type { JWTBodyRequest } from "@/interfaces/user/requests";
import prisma from "@/clients/prisma/client";
import { User } from "@prisma/client";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { jwtVerify } from "jose";
import { NextApiResponse } from "next/types";


const algorithm = 'aes-256-cbc';
// Generate a secure, random key
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY
if(DB_ENCRYPTION_KEY === undefined){
  throw new Error('DB_ENCRYPTION_KEY is undefined')
}

const key = Buffer.from(DB_ENCRYPTION_KEY, 'utf-8');
// Generate an initialization vector

const JWT_SECRET__KEY = process.env.JWT_SECRET_KEY as string


export async function addOrUpdateUser(user: JWTBodyRequest): Promise<User|null> {
  // Add user to database
  const userExists = await prisma.user.findUnique({
    where: {
      githubID: user.user.id
    }
  })

  // Already exists.
  if(userExists){

    // check if image has changed
    if(userExists.image !== user.user.image){

      const updatedUser = await prisma.user.update({
        where: {
          githubID: user.user.id
        },
        data: {
          image: user.user.image
        }
      })
    }

    return userExists
  }

  // Else if user does not exist, create a new user
  try{
    const newUser = await prisma.user.create({
      data: {
        githubID: user.user.id,
        username: user.user.username,
        image: user.user.image
      }
    })
    return newUser
  
  }catch(e){
    return null
  }
}


export async function updateGitHubUserToken(token:string, user: User){
  const encryptedToken = encrypt(token)
  console.log('token', token)
  console.log('encryptedToken', encryptedToken)
  const updatedUser:User = await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      ghuToken: encryptedToken
    }
  })

  return updatedUser
}


export async function getGitHubUserToken(encryptedToken: string){
  const token = decrypt(encryptedToken)
  return token
}

export function encrypt(text: string): string {
  const iv = randomBytes(16);

  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return the iv and the encrypted message
  const encryptedMessage = iv.toString('hex') + encrypted;

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