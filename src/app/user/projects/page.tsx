'use client'
import {
  FolderPlusIcon,

} from '@heroicons/react/24/outline'

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Title, Group } from '@mantine/core';
import { useEffect, useState } from 'react'

import { Repo } from '@/backend/interfaces/repo'


import { useSession } from 'next-auth/react'

import { ProjectType, HAInstallType, getAllHaInstallTypes, ProjectAllInfo } from '@/backend/interfaces/project'

import { AddProjectResponse, MAX_FILE_SIZE } from '@/backend/interfaces/project/request'


import ProjectGrid from '@/frontend/components/project/ProjectGrid';

import { LoadProjects } from '@/frontend/interfaces/project';
import AddorEditProject from '@/frontend/components/project/AddorEditProject';






export default function Page() {
  const [opened, { open, close }] = useDisclosure(false);

  const [projectsLoadedState, setProjectsLoadedState] = useState<LoadProjects>()
  const [unclaimedProjectsLoadedState, setUnclaimedProjectsLoadedState] = useState<LoadProjects>()

  const { data: session, status } = useSession()



  return (
    <div className="bg-white py-24 sm:py-28 w-full">
      <div className="mx-auto max-w-[150%] px-6 lg:px-2">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl py-4">Your Projects</h2>
        </div>
        <div className=" w-full h-full">
          <div key={`create-new-project`} className="mx-auto col-span-1 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl py-8 my-4 min-w-[10.5rem] sm:max-h-none max-h-[15rem]">
            <button
              type="button"
              className="relative block w-full h-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={open}
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <FolderPlusIcon />
              </svg>
              <span className="mt-2 block text-sm font-semibold text-gray-900">New Project</span>
            </button>

            <AddorEditProject opened={opened} open={open} close={close}/>
          </div>
        </div>
        {unclaimedProjectsLoadedState
          && unclaimedProjectsLoadedState.reqStatus === 'success'
          && unclaimedProjectsLoadedState.projects
          && unclaimedProjectsLoadedState.projects.length > 0 ?
          <div className="flex min-w-0 px-6">
            <h3 className="inline-block text-2xl sm:text-lg font-extrabold text-slate-900 tracking-tight dark:text-slate-900 py-2">Your projects imported by others:
            </h3>
          </div> : null}

        {/* <ProjectGrid projectParams={{ githubUserID: session?.user.githubID, checkImported: true }} setProjectState={setUnclaimedProjectsLoadedState} />
        {unclaimedProjectsLoadedState && unclaimedProjectsLoadedState.reqStatus === 'success'
          && unclaimedProjectsLoadedState.projects && unclaimedProjectsLoadedState.projects.length > 0 ?
          <div className="flex min-w-0 px-6">
            <h3 className="inline-block text-2xl sm:text-lg font-extrabold text-slate-900 tracking-tight dark:text-slate-900 py-2 pt-6">Your projects:
            </h3>
          </div> : null} */}

        {projectsLoadedState && projectsLoadedState.projects && projectsLoadedState.projects.length > 0 ? null
          : <h4 className="text-sm font-bold tracking-tight text-gray-900 sm:text-sm py-4 px-3 mx-auto text-center">
            Your projects will be shown below when you create a project.
          </h4>}
        <ProjectGrid projectParams={{ githubUserID: session?.user.githubID, ownedOrImported: true }} setProjectState={setProjectsLoadedState} allowLoadMore={true}/>
        
      </div>
    </div>

  )
}
