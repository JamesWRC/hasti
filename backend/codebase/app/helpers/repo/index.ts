import { GHAppInstallation, GHAppSenderWHSender, RepositoryData } from "@/backend/app/interfaces/repo"
import prisma from "@/backend/app/clients/prisma/client"
import type { User } from '@prisma/client'

import { request } from "https"
import logger from "@/backend/app/logger"
import { getGitHubUserAuth } from "@/backend/app/helpers/auth/github"
import { getGitHubUserToken } from "@/backend/app/helpers/user"


// Add repository to the database
export default async function addOrUpdateRepo(repo: RepositoryData, user: User, sender:GHAppSenderWHSender, installation:GHAppInstallation) {
  // Add repo to database
  if(!repo.id){
    return false
  }

  const repoExists = await prisma.repo.findUnique({
    where: {
      gitHubRepoID: repo.id
    }
  })


  // Get repo collaborators
  const gitHubUserRequest = await getGitHubUserAuth(user)
  const owner: string = repo.full_name.split('/')[0]
  const repoName: string = repo.full_name.split('/')[1]
  const collaborators = await gitHubUserRequest.request("GET /repos/{owner}/{repo}/collaborators", {
    owner: owner,
    repo: repoName
  })
  
  console.log('collaborators', collaborators)
  console.log('permissions', collaborators.data.map((c:any) => c.permissions))

  // Already exists.
  if(repoExists){
    // Only update if repo is a User repo (not an org) and was added by the user.
    // Else whoever has access to the project can manually update it.
    if(repoExists.ownerType === 'user' && repoExists.addedByGithubID === sender.id){
      await prisma.repo.update({
        where: {
          gitHubRepoID: repo.id
        },
        data: {
          name: repo.name,
          fullName: repo.full_name,
          gitAppHasAccess: true,
          ownerGithubID: installation.account.id,
          ownerType: installation.account.type.toLowerCase(),
          addedByGithubID: sender.id,
        }
      })
    }
    // // check if name has changed
    //   await prisma.repo.update({
    //     where: {
    //       repoID: repo.id
    //     },
    //     data: {
    //       name: repo.name,
    //       fullName: repo.full_name,
    //       gitAppHasAccess: true,
    //       ownerGithubID: installation.account.id,
    //       ownerType: installation.account.type,
    //       addedByGithubID: sender.id,
    //     }
    //   })

  }else{
    try{

      await prisma.repo.create({
        data: {
          gitHubRepoID: repo.id,
          gitHubNodeID: repo.node_id,
          name: repo.name,
          fullName: repo.full_name,
          private: repo.private,
          userID: user.id,
          gitAppHasAccess: true,
          ownerGithubID: installation.account.id,
          ownerType: installation.account.type,
          addedByGithubID: sender.id,
        }
      })
    
    }catch(e){
      logger.error(`Error adding repo: ${e}`)
      return false
    }
  }
  return true


  // Else if repo does not exist, create a new repo

}


export async function removeRepo(repo: RepositoryData) {
    // Add repo to database
    const repoExists = await prisma.repo.findUnique({
        where: {
          gitHubRepoID: repo.id
        }
    })
    
    if(repoExists){
        const oneMinuteAgo = new Date();
        oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

        // Else if repo does not exist, create a new repo
        try{
            // Delete repo
            const delRepo = await prisma.repo.delete({
                where: {
                    gitHubRepoID: repo.id,
                    updatedAt: {
                        lt: oneMinuteAgo.toISOString(), // Use ISO string format for comparison
                    },
                }
            })
            return true
        
        }catch(e){
            return false
        }
    }else{
        return false
    }
}


export async function setGitAppHasAccess(repo: RepositoryData, hasAccess: boolean){

  const oneMinuteAgo = new Date();
  oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
  
  await prisma.repo.update({
        where: {
          gitHubRepoID: repo.id,
        },
        data: {
          gitAppHasAccess: hasAccess
        }
    })
    return true
}
export async function getRepoTopics(username: string, repo: string){
    const topics = await request({
        hostname: 'api.github.com',
        path: `/repos/${username}/${repo}/topics`,
        headers: {
            'Accept': 'application/vnd.github.mercy-preview+json',
            'User-Agent': 'request'
        }
    })

    return topics
}


export async function deleteRepo(id: string){
    await prisma.repo.delete({
        where: {
            id: id
        }
    })
    return true
}