import { UserJWT, UserType, getUserType } from "@/backend/interfaces/user";
import type { JWTBodyRequest } from "@/backend/interfaces/user/request";
import prisma from "@/backend/clients/prisma/client";
import { User } from "@prisma/client";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { jwtVerify } from "jose";
import { NextApiResponse } from "next/types";
import { decrypt, encrypt } from "../auth";
import { OctokitResponse } from "@octokit/types";
import { NotificationAbout, NotificationType } from "@/backend/interfaces/notification";



export default async function addOrUpdateUser(user: JWTBodyRequest): Promise<User|null> {

  // Check if user is valid
  if(!user.user || !user.user.id || !user.user.username || !user.user.image){
    return null
  }

  // Add user to database
  let currUser:User|null = await prisma.user.findUnique({
    where: {
      githubID: user.user.id
    }
  })
  
  // Already exists.
  if(currUser){
      // Update user type if needed. Temp users are now users.
      let userType: UserType = getUserType(currUser.type)
      if(userType === UserType.TEMP){
        userType = UserType.USER
      }

      const updatedUser = await prisma.user.update({
        where: {
          githubID: user.user.id
        },
        data: {
          image: user.user.image,
          type: userType
        }
      })
    
  }else{
    // Else if user does not exist, create a new user
    try{
      currUser = await prisma.user.create({
        data: {
          githubID: user.user.id,
          githubNodeID: user.user.node_id,
          username: user.user.username,
          image: user.user.image
        }
      })

    }catch(e){
      return null
    }
  }

  // Update the GitHub user token if it has changed.
  if(getGitHubUserToken(currUser.ghuToken) !== user.user.ghu_token){
    await updateGitHubUserToken(user.user.ghu_token, currUser)
  }

  return currUser

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


export function getGitHubUserToken(encryptedToken: string){
  let token = ''

  // Decrypt the token. decrypt() will error if the token is empty.
  if(encryptedToken.length > 0){
    token = decrypt(encryptedToken)
  }

  return token
}


/**
 * - Add a temporary user to the database. This is used when a user adds a project to HASTI, but is not a registered user.
 * Will be upgraded to a USER type when they login.
 * - Also notifies the owner/collaborator of their repo that a temp user has been created.
 * @param newUserGitHubID - The GitHub ID of the new user.
 * @param newUserGithubNodeID - The GitHub Node ID of the new user.
 * @param newUserUsername - The GitHub username of the new user.
 * @param newUserImage - The GitHub image of the new user.
 * @param addedByUser - The user who added the project to HASTI. And thus 'created' the temp user.
 * @param repoName - The name of the repo.
 * @returns The temp user that was created.
 */
export async function createTempUser(newUserGitHubID:number, newUserGithubNodeID:string, newUserUsername:string, newUserImage:string, addedByUser: User, repoName: string): Promise<User>{
    const projectOwnerUser:User = await prisma.user.create({
      data: {
          githubID: newUserGitHubID,    
          githubNodeID: newUserGithubNodeID,
          username: newUserUsername,     
          image: newUserImage,
          type: UserType.TEMP,
          ghuToken: addedByUser.ghuToken // Use the authenticated Users token for the temp user.

      }
  })

  // Notify the owner of the repo that a temp user has been created. And someone added a project to HASTI
  await prisma.notification.create({
      data: {
          type: NotificationType.SUCCESS,
          title: projectOwnerUser.username,
          message: `Temporary user created, as the user: '${addedByUser.username}' added a project to HASTI using a repo you own / are a collaborator of, called: '${repoName}'.`,
          about: NotificationAbout.USER,
          read: false,
          userID: projectOwnerUser.id,

      }
  });

  return projectOwnerUser
}