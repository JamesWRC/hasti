import { GHAppInstallation, GHAppSenderWHSender, RepoOwnerType, RepositoryData } from "@/backend/interfaces/repo"
import prisma from "@/backend/clients/prisma/client"
import type { Repo, User } from '@prisma/client'

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

  let repo = await prisma.repo.findUnique({
    where: {
      gitHubRepoID: repoData.id
    }
  })
  

  // Update or add repo
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
      
      const gitAppHasAccess = addedByGitHubID === ownerGithubID

      repo = await prisma.repo.create({
        data: {
          gitHubRepoID: repoData.id,
          gitHubNodeID: repoData.node_id,
          name: repoData.name,
          fullName: repoData.full_name,
          private: repoData.private,
          userID: user.id,
          gitAppHasAccess: gitAppHasAccess,
          ownerGithubID: ownerGithubID,
          ownerType: repoOwnerType.toLowerCase(),
          addedByGithubID: addedByGitHubID,
        }
      })
      
    
    }catch(error){
      logger.warn(`Error adding repo: ${(error as Error).message} - ${(error as Error).stack}`)

      return null
    }
  }


  await updateRepoData(repo, user, addedByGitHubID)


  return repo
}


/**
 * ## Updates the repository data.
 * - This includes updating the collaborators and the repo metadata.
 * @param repo 
 * @param user 
 * @param addedByGitHubID // The GitHub ID of the user who added the repo. Will be used to determine if the user is the owner. Will be the same as the owner if the user is the owner.
 */
export async function updateRepoData(repo: Repo, user: User, addedByGitHubID: number){
  const owner: string = repo.fullName.split('/')[0]
  const repoName: string = repo.fullName.split('/')[1]

  let authUser:User|null = user;
  if(addedByGitHubID !== user.githubID){
    authUser = await prisma.user.findUnique({
      where: {
        githubID: addedByGitHubID
      },
      omit: {
        ghuToken: false
      }
    })
  }

  if(authUser === null){
    logger.warn(`Failed to get user for getGitHubUserAuth()`)
    return null
  }

  const gitHubUserRequest = await getGitHubUserAuth(authUser)


  // update collaborators
  const collaborators = await gitHubUserRequest.request("GET /repos/{owner}/{repo}/collaborators", {
    owner: owner,
    repo: repoName
  }).catch((e:any) => {
    logger.warn(`Error getting collaborators: ${e}`)
  });

  if(collaborators){

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
          const newUserGithubNodeID:string = collaborator.node_id
          const newUserUsername:string = collaborator.login
          const newUserImage:string = collaborator.avatar_url

          let tempUser:User|null = null
          if(user.githubID !== collaborator.id){
            // Check if the user already exists
            const userExists = await prisma.user.findFirst({
              where: {
                githubID: newUserGitHubID
              }
            })

            if(userExists){
              tempUser = userExists
            }else{
              tempUser = await createTempUser(newUserGitHubID, newUserGithubNodeID, newUserUsername, newUserImage, user, repoName)
            }
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
        }catch(error){
          logger.error(`Error adding collaborator: ${(error as Error).message} - ${(error as Error).stack}`)

          return null
        }
      }
    }
  }

  let updatedRepoData:OctokitResponse<any, number> | null = await getGitHubRepoData(user, owner, repoName)
  // Update repo metadata
  if(updatedRepoData){

    
    await prisma.repo.update({
      where: {
        id: repo.id
      },
      data: {
        repoCreatedAt: updatedRepoData.data.created_at,
        repoPushedAt: updatedRepoData.data.updated_at,
        
        forked: updatedRepoData.data.fork,
        forks: updatedRepoData.data.forks_count,
        forkedGitHubRepoID: updatedRepoData.data.fork ? updatedRepoData.data.source.id : 0,
        forkedGitHubNodeID: updatedRepoData.data.fork ? updatedRepoData.data.source.node_id : "",
        forkedRepoFullName: updatedRepoData.data.fork ? updatedRepoData.data.source.full_name : "",
        forkedGitHubOwnerID: updatedRepoData.data.fork ? updatedRepoData.data.source.owner.id : 0,

        archived: updatedRepoData.data.archived,
      }
    })
    logger.warn(`Updated repo data for ${repoName} updated`)
  }
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
  // Find all projects that reference the repo
  const projects = await prisma.project.findMany({
      where: {
          repoID: id
      }
  });

  // Delete or update the projects
  for (const project of projects) {
      await prisma.project.delete({
          where: {
              id: project.id
          }
      });
  }

  // Find all collaborators that reference the repo
  const collaborators = await prisma.collaborator.findMany({
      where: {
          repoID: id
      }
  });

  // Delete or update the collaborators
  for (const collaborator of collaborators) {
      await prisma.collaborator.delete({
          where: {
              id: collaborator.id
          }
      });
  }

  // Now you can delete the repo
  await prisma.repo.delete({
      where: {
          id: id
      }
  });

  return true;
}