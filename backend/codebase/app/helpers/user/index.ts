import { User, UserJWT, UserType, getUserType } from "@/backend/interfaces/user";
import type { JWTBodyRequest } from "@/backend/interfaces/user/request";
import prisma from "@/backend/clients/prisma/client";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { jwtVerify } from "jose";
import { decrypt, encrypt } from "../auth";
import { OctokitResponse } from "@octokit/types";
import { NotificationAbout, NotificationType } from "@/backend/interfaces/notification";
import axios from "axios";
import { getGitHubUserAuth } from "../auth/github";



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

      await prisma.user.update({
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
          image: user.user.image,
        },
        omit: {
          ghuToken: false
        }
      })

    }catch(e){
      return null
    }
  }
  console.log('currUser', currUser)
  // Update the GitHub user token if it has changed.
  if(!currUser.ghuToken || currUser.ghuToken.length === 0 || getGitHubUserToken(currUser.ghuToken) !== user.user.ghu_token){
    await updateGitHubUserToken(user.user.ghu_token, currUser)
  }

  return currUser

}


export async function updateGitHubUserToken(token:string, user: User){
  console.log('updateGitHubUserToken', token, user)
  // Check if token is empty, if so return the user.
  if(token.length <= 0) return user

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

interface UserData {
  followers: number;
  publicRepos: number;
  createdAt: string;
  recentActivityCount: number;
  starsCount: number;
  forksCount: number;
  contributorsCount: number;
}

async function fetchUserGitHubData(user: User): Promise<UserData> {
  console.log('fetchUserGitHubData', user)
  // const userResponse = await axios.get(`https://api.github.com/users/${username}`);
  const gitHubUserAuth = await getGitHubUserAuth(user);
  const userResponse = await gitHubUserAuth.request('GET /users/{username}', {
    username: user.username
  });
  console.log('userResponse', userResponse)

  const userData = userResponse.data;
  console.log('userData.repos_url', userData.repos_url)
  const reposResponse = await gitHubUserAuth.request('GET /users/{username}/repos', {
    username: user.username
  });
  const reposData = reposResponse.data;

  let starsCount = 0;
  let forksCount = 0;
  let contributorsCount = 0;
  if(reposData){
    for (const repo of reposData) {
      // console.log("repo++", repo)
        if(repo && repo.stargazers_count && repo.forks_count && repo.contributors_url){
          starsCount += repo.stargazers_count;
          forksCount += repo.forks_count;
          // console.log("++", repo.contributors_url)
          // const contributorsResponse = await axios.get(repo.contributors_url);
          const contributorsResponse = await gitHubUserAuth.request('GET /repos/{owner}/{repo}/contributors', {
            owner: user.username,
            repo: repo.name
          });
          
          contributorsCount += contributorsResponse.data.length;
        }
    }

    console.log('userData.events_url', userData.events_url)
    const eventsResponse = await gitHubUserAuth.request('GET /users/{username}/events', {
      username: user.username
    });
    const recentActivityCount = eventsResponse.data.length;

    return {
        followers: userData.followers,
        publicRepos: userData.public_repos,
        createdAt: userData.created_at,
        recentActivityCount,
        starsCount,
        forksCount,
        contributorsCount
    };
  }else{
    return {
      followers: 0,
      publicRepos: 0,
      createdAt: new Date().toISOString(),
      recentActivityCount: 0,
      starsCount: 0,
      forksCount: 0,
      contributorsCount: 0
    };
  
  }

}

function calculateTrustworthinessRating(userData: UserData): number {
  const { followers, publicRepos, createdAt, recentActivityCount, starsCount, forksCount, contributorsCount } = userData;

  // Normalize the values
  const followerScore = Math.min(followers / 1000, 1) * 25;
  const repoScore = Math.min(publicRepos / 50, 1) * 10;
  const ageInYears = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24 * 365);
  const ageScore = Math.min(ageInYears / 5, 1) * 15;
  const activityScore = Math.min(recentActivityCount / 100, 1) * 10;
  const starsScore = Math.min(starsCount / 1000, 1) * 20;
  const forksScore = Math.min(forksCount / 500, 1) * 10;
  const contributorsScore = Math.min(contributorsCount / 100, 1) * 10;

  const totalScore = followerScore + repoScore + ageScore + activityScore + starsScore + forksScore + contributorsScore;
  
  return Math.min(Math.round(totalScore), 100);
}

export async function getTrustworthinessRating(user: User): Promise<number> {
  const userData = await fetchUserGitHubData(user);
  return calculateTrustworthinessRating(userData);
}
