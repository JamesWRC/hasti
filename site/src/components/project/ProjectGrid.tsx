

'use client'
import {
  FolderPlusIcon,
  PhotoIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import PackageCard from '@/components/store/ProjectCard'
import { Grid } from '@mantine/core';

import type { UserProject } from "@/backend/interfaces/project/request";
import useProjects from '@/components/project'

export default function ProjectGrid() {

    const {loadedProjects, reqStatus} = useProjects({});


    return (
        <div className="bg-white w-full">
          <div className="mx-auto max-w-[150%] px-6 lg:px-2">
            <Grid>
            <div className={!loadedProjects || loadedProjects.length <= 0 ? "mx-auto max-w-2xl text-center" : "m-auto w-full h-full"}>
                {!loadedProjects || !loadedProjects || loadedProjects.length <= 0 ? <h4 className="text-sm font-bold tracking-tight text-gray-900 sm:text-sm py-4 px-3">
                You projects will be shown below when you create a project.
                </h4>: null }
                {reqStatus === 'loading' ? 
              <div className="mx-auto max-w-2xl text-center">
                <h4 className="text-sm font-bold tracking-tight text-gray-900 sm:text-sm py-4 px-3">Loading...</h4>
                </div> : reqStatus === 'error' ?
                <div className="mx-auto max-w-2xl text-center">
                  <h4 className="text-sm font-bold tracking-tight text-gray-900 sm:text-sm py-4 px-3">Error loading projects. Please try again later.</h4>
                  </div> : null
              }
              </div>
              {loadedProjects && loadedProjects.length > 0 ? loadedProjects.map((userProject:UserProject, index:number) => (
                <>
                  {/* {index === 0 ? createNewProject() : null} */}
    
                  <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={`user-project-${userProject.project.id}`}>
    
                    <PackageCard userProject={userProject} style={"featured"} loaded={reqStatus === "success"} />
                  </Grid.Col>
                </>
    
              ))
              : null } 

            </Grid>
          </div>
        </div>
    
      )
  }
  