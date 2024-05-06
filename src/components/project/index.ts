import { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react'
import { LoadProjects } from '@/frontend/interfaces/project';
import { GetProjectsResponse, GetProjectsQueryParams } from '@/backend/interfaces/project/request';
import { ProjectAllInfo, ProjectWithUser } from '@/backend/interfaces/project'


export default function useProjects({...props}: GetProjectsQueryParams):LoadProjects {
  const [projects, setProjects] = useState<GetProjectsResponse>(generatePlaceHolderProjects(props.limit || 10));
  const [reqStatus, setReqStatus] = useState('idle'); // idle, loading, success, error
  
  const { data: session, status } = useSession()
  useEffect(() => {
    const fetchData = async () => {
        setReqStatus('loading');
      try {

        //Build query string
        // Set the limit of the number of notifications to fetch
        let queryStr = props.limit ? `?limit=${props.limit}` : '';
        // set the project type
        if (props.type) queryStr += `${queryStr ? '&' : '?'}type=${props.type}`;

        // Set the cursor to the next 'page' of notifications
        if (props.cursor) queryStr += `${queryStr ? '&' : '?'}cursor=${props.cursor}`;

        // Set the userID
        if (props.userID) queryStr += `${queryStr ? '&' : '?'}userID=${props.userID}`;

        // Set the username 
        if (props.username) queryStr += `${queryStr ? '&' : '?'}username=${props.username}`;

        // Set the github userID
        if (props.githubUserID) queryStr += `${queryStr ? '&' : '?'}githubUserID=${props.githubUserID}`;

        // Set the ownedByGithubUserID
        if (props.checkImported) queryStr += `${queryStr ? '&' : '?'}checkImported=${props.checkImported}`;

        // Set the ownedOrImported
        if (props.ownedOrImported) queryStr += `${queryStr ? '&' : '?'}ownedOrImported=${props.ownedOrImported}`;

        // Set the orderBy
        if (props.orderBy) queryStr += `${queryStr ? '&' : '?'}orderBy=${props.orderBy}`;

        // Set the orderDirection
        if (props.orderDirection) queryStr += `${queryStr ? '&' : '?'}orderDirection=${props.orderDirection}`;

        // Set the projectTitle
        if (props.projectTitle) queryStr += `${queryStr ? '&' : '?'}projectTitle=${props.projectTitle}`;

        // Set the allContent
        if (props.allContent) queryStr += `${queryStr ? '&' : '?'}allContent=${props.allContent}`;

        console.log("props server: ", props)
        console.log("queryStr: ", queryStr)
        // sleep for 2 seconds to simulate a slow network
        await new Promise((resolve) => setTimeout(resolve, 4000));
        const response = await fetch(`${process.env.API_URL}/api/v1/projects` + queryStr, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.user.jwt}`
            }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        // return the projects found.
        if(response.status === 200){
          const jsonData:GetProjectsResponse = await response.json();
          console.log("jsonData: ", jsonData)
          setProjects(jsonData);
          setReqStatus('success');
        // If HTTP 204, return success, with empty projects. As there are no projects to return.
        }else if(response.status === 204){
          const emptyProjectsResponse:GetProjectsResponse = {
            success: true,
            userProjects: []
          }
          setProjects(emptyProjectsResponse);
          setReqStatus('success');
        }

      } catch (error) {
        setReqStatus('error');
        console.error('Error fetching data:', error); 
      }
    };

    fetchData();

    return () => {
      // Cleanup function
    };
  }, []);


    const retVal:LoadProjects = {
      projects: projects.userProjects,
      reqStatus
    }
    console.log("retVal12: ", retVal)
    return retVal;



};

function generatePlaceHolderProjects(count:number):GetProjectsResponse {
  let userProjects = [];
  for (let i = 0; i < count; i++) {

    // const seededRand = require('random-seed').create(`A ${i}` )
    // const seededRand = require('random-seed').create(`E${i}` )
    // const seededRand = require('random-seed').create(`H${i}` )
    // const seededRand = require('random-seed').create(`H${i}` )

    const random = Math.floor(Math.random() * 1000) + 1;


    const userProject:ProjectAllInfo = {
      id: random.toString(),
      title: "Project Title",
      content: "Project Content",
      description: "Project Description",
      published: true,
      userID: i.toString(),
      repoID: i.toString(),
      worksWithContainer: true,
      worksWithCore: false,
      worksWithOS: true,
      worksWithSupervised: true,
      projectType: "project",
      profileImage: "SKELETON",
      backgroundImage: "SKELETON",
      contentImages: ["SKELETON"],
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: random.toString(),
        githubID: i,
        username: "username",
        image: "SKELETON",
        createdAt: new Date(),
        updatedAt: new Date(),
        type: "user",
      },
      tags: Array.from({ length:  Math.floor(Math.random() * 10) + 1 }).map((i) => {
        return {
          id: random.toString(),
          name: "Tag Name",
          type: "tag",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }),
      repo: {
        id: random.toString(),
        name: "Repo Name",
        createdAt: new Date(),
        updatedAt: new Date(),
        addedByGithubID: i,
        fullName: "Repo Full Name",
        gitAppHasAccess: true,
        gitHubNodeID: "Repo Node ID",
        gitHubRepoID: i,
        gitHubStars: i,
        gitHubWatchers: i,
        ownerGithubID: i,
        private: false,
        ownerType: "user",
        userID: i.toString(),

      },
    }
    userProjects.push(userProject);
  }
  return {
    success: true,
    userProjects: userProjects
  }
}
