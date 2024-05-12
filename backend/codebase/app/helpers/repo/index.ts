import { GHAppInstallation, GHAppSenderWHSender, RepoOwnerType, RepositoryData } from "@/backend/interfaces/repo"
import prisma from "@/backend/clients/prisma/client"
import type { User } from '@prisma/client'

import { request } from "https"
import logger from "@/backend/logger"
import { getGitHubUserAuth } from "@/backend/helpers/auth/github"
import { createTempUser, getGitHubUserToken } from "@/backend/helpers/user"
import { OctokitResponse } from "@octokit/types"
import { getGitHubRepoData } from "@/backend/helpers/project"
import { getCollaboratorType } from "@/backend/interfaces/collaborator"


/**
 * ## Adds a repository to the database if it does not exist.
 * If it does exist, it will update the owner details if the user is the owner.
 * - The owner details can be updated if the user has claimed the repo.
 * 
 * logic is as follows:
 * 1. Collaborators will be added / updated to the database.
 * 2. The repo metadata will be updated. (Stars, watchers, etc.)
 * - **NOTE:** Orgs are not supported to be claimed yet.
 * @param repoData 
 * @param user 
 * @param addedByGitHubID 
 * @param ownerGithubID 
 * @param repoOwnerType 
 * @param updateOwnerDetails 
 * @returns 
 */
export default async function addOrUpdateRepo(repoData: RepositoryData, user: User, addedByGitHubID:number, ownerGithubID: number, repoOwnerType: string, updateOwnerDetails:boolean = false) {

  // Add repo to database
  if(!repoData.id){
    return null
  }

  let repo = await prisma.repo.findUnique({
    where: {
      gitHubRepoID: repoData.id
    }
  })
  


  // Get repo collaborators
  const gitHubUserRequest = await getGitHubUserAuth(user)
  const owner: string = repoData.full_name.split('/')[0]
  const repoName: string = repoData.full_name.split('/')[1]

  let updatedRepoData:OctokitResponse<any, number> | null = await getGitHubRepoData(user, owner, repoName)

  // Already exists.
  if(repo){
    // Update owner details. IE if a user has claimed the repo. And the user is the owner.
    // Orgs are not supported to be claimed yet.
    if(updateOwnerDetails && repo.ownerGithubID === user.githubID && repo.ownerType === RepoOwnerType.USER.toLowerCase()){
      repo = await prisma.repo.update({
        where: {
          gitHubRepoID: repoData.id
        },
        data: {
          ownerGithubID: ownerGithubID,
          ownerType: repoOwnerType.toLowerCase(),
        }
      })
    // Only update if repo is a User repo (not an org) and was added by the user.
    // Else whoever has access to the project can manually update it.
    }else if(repo.ownerType === RepoOwnerType.USER.toLowerCase() && repo.addedByGithubID === addedByGitHubID){
      repo = await prisma.repo.update({
        where: {
          gitHubRepoID: repoData.id
        },
        data: {
          name: repoData.name,
          fullName: repoData.full_name,
          gitAppHasAccess: true,
          ownerGithubID: ownerGithubID,
          ownerType: repoOwnerType.toLowerCase(),
        }
      })
    }
  }else{
    try{


      repo = await prisma.repo.create({
        data: {
          gitHubRepoID: repoData.id,
          gitHubNodeID: repoData.node_id,
          name: repoData.name,
          fullName: repoData.full_name,
          private: repoData.private,
          userID: user.id,
          gitAppHasAccess: true,
          ownerGithubID: ownerGithubID,
          ownerType: repoOwnerType.toLowerCase(),
          addedByGithubID: addedByGitHubID,
        }
      })
      
    
    }catch(e){
      logger.error(`Error adding repo: ${e}`)
      return null
    }
  }

  // Update repo metadata
  if(updatedRepoData){
    await prisma.repo.update({
      where: {
        gitHubRepoID: repoData.id
      },
      data: {
        gitHubStars: updatedRepoData.data.stargazers_count,
        gitHubWatchers: updatedRepoData.data.watchers_count,
      }
    })
  }

  // update collaborators
  const collaborators = await gitHubUserRequest.request("GET /repos/{owner}/{repo}/collaborators", {
    owner: owner,
    repo: repoName
  })
  
  console.log('collaborators', collaborators)
  console.log('permissions', collaborators.data.map((c:any) => c.permissions))

  // Add collaborators to the database
  for(const collaborator of collaborators.data){
    console.log("collaborator", collaborator)
    const collaboratorExists = await prisma.collaborator.findFirst({
      where: {
        githubID: collaborator.id, // Add the 'id' property to the 'where' clause
        repo: {
          id: repo.id
        }
      }
    })
    console.log("collaborator exists", collaboratorExists)

    if(!collaboratorExists){
      console.log('adding collaborator', collaborator)
      try{
        

        // If the collaborator is not a user, create a temp user
        const newUserGitHubID:number = collaborator.id
        const newUserGithubNodeID:string = "collaborator.id"
        const newUserUsername:string = collaborator.login
        const newUserImage:string = collaborator.avatar_url

        let tempUser:User|null = null
        if(user.githubID !== collaborator.id){
          tempUser = await createTempUser(newUserGitHubID, newUserGithubNodeID, newUserUsername, newUserImage, user, repoName)
        }else{
          tempUser = user
        }
        
        // Get the collaborators type
        const type = getCollaboratorType(collaborator.type)

        // Get the collaborator's permissions
        const admin = collaborator.permissions?.admin ? true : false
        const maintain = collaborator.permissions?.maintain ? true : false
        const push = collaborator.permissions?.push ? true : false
        const triage = collaborator.permissions?.triage ? true : false
        const pull = collaborator.permissions?.pull ? true : false

        await prisma.collaborator.create({
          data: {
            repoID: repo.id,
            userID: tempUser.id,
            githubID: collaborator.id,
            type: type,
            // Set the permissions of the collaborator
            admin: admin,
            maintain: maintain,
            push: push,
            triage: triage,
            pull: pull,

          }
        })
      }catch(e){
        logger.error(`Error adding collaborator: ${e}`)
        return null
      }
    }
  }

  return repo
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