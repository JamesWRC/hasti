import { RepositoryData } from "@/interfaces/repo"
import prisma from "@/clients/prisma/client"
import type { User } from '@prisma/client'

import { request } from "https"


// Add repository to the database
export async function addOrUpdateRepo(repo: RepositoryData, user: User) {
  // Add repo to database
  const repoExists = await prisma.repo.findUnique({
    where: {
      repoID: repo.id
    }
  })
  console.log('repoExists', repoExists)
  // Already exists.
  if(repoExists){

    // check if name has changed
    if(repoExists.name !== repo.name){

      const updatedRepo = await prisma.repo.update({
        where: {
          repoID: repo.id
        },
        data: {
          name: repo.name,
          fullName: repo.full_name,
        }
      })
    }

    return true
  }

  // Else if repo does not exist, create a new repo
  try{

    const newRepo = await prisma.repo.create({
      data: {
        repoID: repo.id,
        nodeID: repo.node_id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        userID: user.id,
      }
    })
    console.log('newRepo', newRepo)
    return true
  
  }catch(e){
    console.log('e', e)
    return false
  }
}


export async function removeRepo(repo: RepositoryData) {
    // Add repo to database
    const repoExists = await prisma.repo.findUnique({
        where: {
        repoID: repo.id
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
                    repoID: repo.id,
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