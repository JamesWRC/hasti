import { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react'
import { LoadProjects } from '@/interfaces/project';
import { GetProjectResponse, UserProject } from '@/backend/interfaces/project/request';
import { GetProjectsQueryParams } from '@/backend/interfaces/user/requests';


export default function useProjects({...props}: GetProjectsQueryParams):LoadProjects {
  const [projects, setProjects] = useState<GetProjectResponse|null>(generatePlaceHolderProjects(props.limit || 10));
  const [reqStatus, setReqStatus] = useState('idle'); // idle, loading, success, error
  
  const { data: session, status } = useSession()
  useEffect(() => {
    const fetchData = async () => {
        setReqStatus('loading');
      try {
        //Build query string
        let queryStr = '';
        if (props.limit) {
          queryStr = `?limit=${props.limit}`;
        }
        // sleep for 2 seconds to simulate a slow network
        await new Promise((resolve) => setTimeout(resolve, 4000));
        const response = await fetch(`${process.env.API_URL}/api/user/projects` + queryStr, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.user.jwt}`
            }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData:GetProjectResponse = await response.json();
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


  if (projects) {
    const retVal:LoadProjects = {
      loadedProjects: projects.userProjects,
        reqStatus
    }
    console.log("retVal12: ", retVal)
    return retVal;

  }else{
    const retVal:LoadProjects = {
      loadedProjects: projects,
        reqStatus
      }
      console.log("retVal1: ", retVal)

      return retVal;
  }


};

function generatePlaceHolderProjects(count:number):GetProjectResponse {
  let userProjects = [];
  for (let i = 0; i < count; i++) {

    // const seededRand = require('random-seed').create(`A ${i}` )
    // const seededRand = require('random-seed').create(`E${i}` )
    // const seededRand = require('random-seed').create(`H${i}` )
    // const seededRand = require('random-seed').create(`H${i}` )

    const random = Math.floor(Math.random() * 1000) + 1;


    const userProject:UserProject = {
      user: {
        id: random.toString(),
        githubID: i,
        username: "username",
        image: "SKELETON",
        ghuToken: "Name",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      project: {
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
        updatedAt: new Date()
      },
    }
    userProjects.push(userProject);
  }
  return {
    success: true,
    userProjects: userProjects
  }
}
