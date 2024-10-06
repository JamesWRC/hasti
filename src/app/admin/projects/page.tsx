"use strict";
"use client";
import { GetUsersQueryParams, GetUsersResponse } from "@/backend/interfaces/user/request";
import useUsers from "@/frontend/components/user";
import { Pagination, Text } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { useEffect, useState } from "react";
import useProjects from '../../../components/project/index';
import { GetProjectsQueryParams } from "@/backend/interfaces/project/request";
import axios from "axios";
import { RefreshRepoDataRequest } from "@/backend/interfaces/repo/request";
import { useSession } from 'next-auth/react'

const people = [
  { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
  // More people...
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}




export default function Accounts() {

  const { data: session, status } = useSession()


  const [limitSearch, setLimitSearch] = useState(20);
  
  const [newSearchProps, setNewSearchProps] = useState<GetProjectsQueryParams>({limit: limitSearch, orderBy: 'title', orderDirection: 'asc'});
  const { projects, reqStatus, setSearchProps } = useProjects(newSearchProps);

  let totalProjects = projects?.length || 0;

  // set search
  const [searchContent, setSearchContent] = useDebouncedState('', 1000);


  const [page, setPage] = useState(0);

  useEffect(() => {
    const skip = limitSearch * page;

    if (searchContent) {
      setNewSearchProps({projectTitle: searchContent});
    }else{
      setNewSearchProps({...newSearchProps, limit: limitSearch, skip: skip, projectTitle: searchContent});

    }
    console.log("newSearchProps: ", newSearchProps)

  }, [limitSearch, page, searchContent])

  useEffect(() => {
    setSearchProps(newSearchProps);
  }, [newSearchProps])


  function updateProjectRepoInfo(repoID:string | undefined) {
    if (!session || !repoID) return;
    // Update the project repo info
    axios({
      url: `${process.env.API_URL}/api/v1/repos/${repoID}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.jwt}`
      },
      timeout: 60000,
      timeoutErrorMessage: 'Request timed out. Please try again.',
    }).then(response => {
      const refreshResponse: RefreshRepoDataRequest = response.data
      alert('Repo data updated successfully')

    }).catch(error => {
      const refreshResponse: RefreshRepoDataRequest = error.data
      alert('Error updating repo data')
      alert(refreshResponse)
      console.error('Error with PUT /api/v1/repos/refresh/:repoID', error)
    });

  }

  function updateProjectInfo(projectID:string | undefined, usingHastiMD:Boolean | undefined) {
    if (!session || !usingHastiMD) return;
    // Update the project repo info
    let contentFileName = 'README'
    if (usingHastiMD) {
      contentFileName = 'HASTI'
    }
    axios({
      url: `${process.env.API_URL}/api/v1/projects/${projectID}/content?updateContentFile=${contentFileName}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.jwt}`
      },
      timeout: 60000,
      timeoutErrorMessage: 'Request timed out. Please try again.',
    }).then(response => {
      const refreshResponse: RefreshRepoDataRequest = response.data
      alert('Repo data updated successfully')

    }).catch(error => {
      const refreshResponse: RefreshRepoDataRequest = error.data
      alert('Error updating repo data')
      alert(refreshResponse)
      console.error(`Error with PUT /api/v1/projects/${projectID}/content?updateContentFile=${contentFileName}`, error)
    });

  }


  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Projects</h1>
          <div>
            <input
              id="user"
              name="user"
              type="user"
              placeholder="search by name"
              onChange={(e) => setSearchContent(e.target.value)}
              className="p-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                  >
                    Repo ID
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                  >
                    Project Type
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-3 pr-4 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                  >
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects ? projects.map((project, projectIdx) => (
                  <tr key={project?.id}>
                    <td
                      className={classNames(
                        projectIdx !== people.length - 1 ? 'border-b border-gray-200' : '',
                        'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell',
                      )}
                    >
                      {project?.id.substring(0, 8)}
                    </td>
                    <td
                      className={classNames(
                        projectIdx !== people.length - 1 ? 'border-b border-gray-200' : '',
                        'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8',
                      )}
                    >
                      {project?.title}
                    </td>
                    <td
                      className={classNames(
                        projectIdx !== people.length - 1 ? 'border-b border-gray-200' : '',
                        'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell',
                      )}
                    >
                      {project?.repoID}
                    </td>
                    <td
                      className={classNames(
                        projectIdx !== people.length - 1 ? 'border-b border-gray-200' : '',
                        'whitespace-nowrap px-3 py-4 text-sm text-gray-500',
                      )}
                    >
                      {project?.projectType}
                    </td>
                    <td
                      className={classNames(
                        projectIdx !== people.length - 1 ? 'border-b border-gray-200' : '',
                        'relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-8 lg:pr-8',
                      )}
                    >
                      <a href="#" className="text-indigo-600 hover:text-indigo-900 px-1" onClick={e => updateProjectRepoInfo(project?.repoID)}>
                        update repo<span className="sr-only">, {project?.claimed}</span>
                      </a>|<a href="#" className="text-indigo-600 hover:text-indigo-900 px-1" onClick={e => updateProjectInfo(project?.id, project?.usingHastiMD)}>
                        update proj
                        <span className="sr-only">, {project?.claimed}</span>
                      </a>
                    </td>
                  </tr>
                ))
              : null
              }
              </tbody>
            </table>
          </div>
          <div className="py-4 text-black">
            <Pagination total={totalProjects / limitSearch} siblings={1} defaultValue={0} onChange={(_page:number)=> setPage(_page)} />  
          </div>
        </div>
      </div>
    </div>
  )
}
