

'use client'
import {
  FolderPlusIcon,
  PhotoIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import PackageCard from '@/frontend/components/store/ProjectCard'
import { Button, Grid } from '@mantine/core';

import type { ProjectWithUser } from '@/backend/clients/prisma/client'
import useProjects from '@/frontend/components/project'
import { GetProjectsQueryParams } from '@/backend/interfaces/project/request';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { LoadProjects } from '@/frontend/interfaces/project';
import { Project } from '@/backend/interfaces/project';

export default function ProjectGrid({ projectParams, setProjectState, allowLoadMore }: { projectParams: GetProjectsQueryParams, setProjectState?: Dispatch<SetStateAction<LoadProjects | undefined>>, allowLoadMore: boolean }) {
  const SEARCH_LIMIT: number = 10

  let fetchProjects: GetProjectsQueryParams;
  if (projectParams) {
    fetchProjects = projectParams;
  } else {
    fetchProjects = {
      limit: 10,
      orderBy: 'createdAt',
    }
  }

  const { projects, reqStatus, setSearchProps } = useProjects(fetchProjects);

  // load more project states
  const [noMoreResults, setNoMoreResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadedProjects, setLoadedProjects] = useState<ProjectWithUser[] | null>([])


  useEffect(() => {

    setProjectState ? setProjectState({ projects, reqStatus, setSearchProps }) : null;

  }, [reqStatus])




  function handleLoadMoreProjects(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setLoading(true)

    e.preventDefault()
    const notifProps: GetProjectsQueryParams = { ...projectParams, limit: SEARCH_LIMIT }
    if (projects && projects.length > 0) {
      notifProps.cursor = projects[projects.length - 1]?.id; // Add null check here
    }
    setSearchProps(notifProps)
    setLoading(false)
    setLoadedProjects(loadedProjects as ProjectWithUser[])
  }

  useEffect(() => {
    console.log('projects', projects)

    // Update the project list with the new projects so the list can be appended, rendered without removing last projects
    if (reqStatus === 'success' && projects && projects.length > 0 && loadedProjects) {
      console.log('appending projects')
      console.log(projects)
      setLoadedProjects([...loadedProjects, ...projects] as ProjectWithUser[]);
    }

    // Set scroll back to top after skeleton loading.
    if ((!loadedProjects || loadedProjects.length === 0) && scrollRef && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      // Keep the scroll at the bottom
    } else if (scrollRef && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    if (projects && projects.length < SEARCH_LIMIT) {
      setNoMoreResults(true)
      setLoading(true)
    }

  }, [projects])




  return (
    <div className="bg-white w-full" ref={scrollRef}>
      <div className="mx-auto max-w-[150%] px-2">
        <Grid>
          <div className={!projects || projects.length <= 0 ? "mx-auto max-w-2xl text-center" : "m-auto w-full h-full"}>
            {reqStatus === 'loading' ?
              <div className="mx-auto max-w-2xl text-center">
                <h4 className="text-sm font-bold tracking-tight text-gray-900 sm:text-sm py-4 px-3">Loading...</h4>
              </div> : reqStatus === 'error' ?
                <div className="mx-auto max-w-2xl text-center">
                  <h4 className="text-sm font-bold tracking-tight text-gray-900 sm:text-sm py-4 px-3">Error loading projects. Please try again later.</h4>
                </div> : null
            }
          </div>
          {loadedProjects && loadedProjects.length > 0 ? loadedProjects.map((project: ProjectWithUser, index: number) => (
            <>
              {/* {index === 0 ? createNewProject() : null} */}

              <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={`user-project-${index}`}>

                <PackageCard userProject={project} style={"featured"} loaded={reqStatus === "success"} />
              </Grid.Col>
            </>

          ))
            : null}

        </Grid>
        <div className=' justify-self-center text-content-body flex justify-center py-5'>
          <div className={noMoreResults ? 'px-auto' : 'hidden'}>No more projects found</div>
          <Button
            loading={reqStatus === "loading"}
            className={!noMoreResults ? 'text-content-body justify-self-center text-bold border border-spacing-1 border-gray-500 rounded-md' : 'hidden'}
            onClick={(e) => handleLoadMoreProjects(e)}>{reqStatus === "success" ? "Load more" : reqStatus + "..."}</Button>

        </div>
      </div>
    </div>

  )
}
