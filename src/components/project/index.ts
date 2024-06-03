import { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react'
import { LoadProjects } from '@/frontend/interfaces/project';
import { GetProjectsResponse, GetProjectsQueryParams } from '@/backend/interfaces/project/request';
import { ProjectAllInfo, ProjectWithUser } from '@/backend/interfaces/project'
import axios from 'axios';


export default function useProjects({...props}: GetProjectsQueryParams):LoadProjects {
  const [searchProps, setSearchProps] = useState<GetProjectsQueryParams>(props);

  const [projects, setProjects] = useState<GetProjectsResponse>(generatePlaceHolderProjects(props.limit || 10));
  const [reqStatus, setReqStatus] = useState('idle'); // idle, loading, success, error
  
  const { data: session, status } = useSession()
  useEffect(() => {
    const fetchData = async () => {
        setReqStatus('loading');
      try {
        console.log("useProjects props: ", searchProps)
        //Build query string
        // Set the limit of the number of notifications to fetch
        let queryStr = searchProps.limit ? `?limit=${searchProps.limit}` : '';

        // set the projectID
        if (searchProps.projectID) queryStr += `${queryStr ? '&' : '?'}projectID=${searchProps.projectID}`;

        // set the project type
        if (searchProps.type) queryStr += `${queryStr ? '&' : '?'}type=${searchProps.type}`;

        // Set the cursor to the next 'page' of notifications
        if (searchProps.cursor) queryStr += `${queryStr ? '&' : '?'}cursor=${searchProps.cursor}`;

        // Set the userID
        if (searchProps.userID) queryStr += `${queryStr ? '&' : '?'}userID=${searchProps.userID}`;

        // Set the username 
        if (searchProps.username) queryStr += `${queryStr ? '&' : '?'}username=${searchProps.username}`;

        // Set the github userID
        if (searchProps.githubUserID) queryStr += `${queryStr ? '&' : '?'}githubUserID=${searchProps.githubUserID}`;

        // Set the ownedByGithubUserID
        if (searchProps.checkImported) queryStr += `${queryStr ? '&' : '?'}checkImported=${searchProps.checkImported}`;

        // Set the ownedOrImported
        if (searchProps.ownedOrImported) queryStr += `${queryStr ? '&' : '?'}ownedOrImported=${searchProps.ownedOrImported}`;

        // Set the orderBy
        if (searchProps.orderBy) queryStr += `${queryStr ? '&' : '?'}orderBy=${searchProps.orderBy}`;

        // Set the orderDirection
        if (searchProps.orderDirection) queryStr += `${queryStr ? '&' : '?'}orderDirection=${searchProps.orderDirection}`;

        // Set the projectTitle
        if (searchProps.projectTitle) queryStr += `${queryStr ? '&' : '?'}projectTitle=${searchProps.projectTitle}`;

        // Set the allContent
        if (searchProps.allContent) queryStr += `${queryStr ? '&' : '?'}allContent=${searchProps.allContent}`;

        console.log("searchProps server: ", searchProps)
        console.log("queryStr: ", queryStr)

        const emptyProjectsResponse:GetProjectsResponse = {
          success: true,
          userProjects: []
        }

        // If there are no search parameters, return success with empty projects.
        if(queryStr === ''){
          setReqStatus('success');
          setProjects(emptyProjectsResponse);

        
        }else{
          // Only fetch data if there are search parameters.
          
          // sleep for 2 seconds to simulate a slow network
          await new Promise((resolve) => setTimeout(resolve, 4000));

          const response = await axios({
            url: `${process.env.API_URL}/api/v1/projects` + queryStr,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user.jwt}`
            },

            timeout: 10000,
            timeoutErrorMessage: 'Request timed out. Please try again.',
          })


          // return the projects found.
          if(response.status === 200){
            const jsonData:GetProjectsResponse = response.data;
            console.log("jsonData: ", jsonData)
            setProjects(jsonData);
            setReqStatus('success');
          // If HTTP 204, return success, with empty projects. As there are no projects to return.
          }else if(response.status === 204){
            setProjects(emptyProjectsResponse);
            setReqStatus('success');
          }
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
  }, [searchProps]);


    const retVal:LoadProjects = {
      projects: projects.userProjects,
      reqStatus,
      setSearchProps
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
      contentSHA: "Content SHA",
      usingHastiMD: false,
      description: "Project Description",
      published: true,
      userID: i.toString(),
      repoID: i.toString(),
      worksWithContainer: false,
      worksWithCore: false,
      worksWithOS: false,
      worksWithSupervised: false,
      activityRating: 0,
      popularityRating: 0,
      overallRating: 0,
      claimed: true,
      projectType: "project",
      iconImage: "SKELETON",
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
        githubNodeID: "Node ID",
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
        ownerGithubID: i,
        private: false,
        ownerType: "user",
        userID: i.toString(),
        repoCreatedAt: new Date(),
        repoPushedAt: new Date(),
        forked: false,
        forks: 0,
        forkedGitHubRepoID: 0,
        forkedGitHubNodeID: '',
        forkedRepoFullName: '',
        forkedGitHubOwnerID: 0,
        archived: false,
        repoAnalytics: [{
            id: random.toString(),
            repoID: random.toString(),
            closedIssues: 0,
            openIssues: 0,
            commits: 0,
            contributors: 0,
            forks: 0,
            stars: 0,
            watchers: 0,
            lastCommit: new Date(),
            license: "MIT",
            pullRequests: 0,
            releases: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }],
      },
    }
    userProjects.push(userProject);
  }
  return {
    success: true,
    userProjects: userProjects
  }
}
