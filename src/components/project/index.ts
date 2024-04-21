import { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react'
import { LoadProjects } from '@/frontend/interfaces/project';
import { GetProjectsResponse, GetProjectsQueryParams } from '@/backend/interfaces/project/request';
import { ProjectWithUser } from '@/backend/interfaces/project'


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
        const jsonData:GetProjectsResponse = await response.json();
        console.log("jsonData: ", jsonData)
        setProjects(jsonData);
        setReqStatus('success');
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


    const userProject:ProjectWithUser = {
      id: random.toString(),
      title: "Project Title",
      content: "Project Content",
      description: "Project Description",
      published: true,
      userID: i.toString(),
      repoID: i.toString(),
      haInstallType: "ha",
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
        ghuToken: "Name",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    userProjects.push(userProject);
  }
  return {
    success: true,
    userProjects: userProjects
  }
}
