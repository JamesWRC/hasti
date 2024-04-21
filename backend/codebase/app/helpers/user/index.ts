import { UserJWT } from "@/backend/app/interfaces/user";
import type { JWTBodyRequest } from "@/backend/app/interfaces/user/request";
import prisma from "@/backend/app/clients/prisma/client";
import { User } from "@prisma/client";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { jwtVerify } from "jose";
import { NextApiResponse } from "next/types";
import { decrypt, encrypt } from "../auth";



export default async function addOrUpdateUser(user: JWTBodyRequest): Promise<User|null> {

  // Check if user is valid
  if(!user.user || !user.user.id || !user.user.username || !user.user.image){
    return null
  }

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
