'use Client'
import { Project, ProjectAllInfo } from '@/backend/interfaces/project'
import { Tag } from '@/backend/interfaces/tag'
import SidePanelTagsContent from '@/frontend/components/store/content/SidePanelContent'
import AuthorDescription from '@/frontend/components/store/AuthorDescription';
import { LoadProjects, getProjectLink, getProjectTypeURL } from '@/frontend/interfaces/project';
import { DynamicSkeletonText, DynamicSkeletonTitle } from "@/frontend/components/ui/skeleton/index";
import { get } from 'lodash';
import { getProjectActivity, getProjectStars, getProjectWorksWithList } from '@/frontend/helpers/project';
import { RepoAnalytics } from '@/backend/interfaces/repoAnalytics';
import moment from 'moment';
import { useState } from 'react';

const people = [
  { title: 'Developer', description: 'INSERT DEVELOPER NAME HERE' },
  // More people...
]

export default function Details({ loadedProject, reqStatus }: { loadedProject: LoadProjects | undefined, reqStatus: string }) {

  // get the single ProjectAllInfo from the array
  const projectData: ProjectAllInfo | null = loadedProject ? loadedProject.projects?.at(0) as ProjectAllInfo : null
  const projectRepoAnalytics: RepoAnalytics | null = projectData?.repo?.repoAnalytics.at(0) || null
  const loaded = reqStatus === 'success'
  const isError = reqStatus === 'error'
  console.log('isLoading side', loaded)
  const tags: Tag[] = projectData?.tags || []
  const [isExpanded, setIsExpanded] = useState(false);

  const tagBaseURL: string = getProjectTypeURL(projectData)

  return (
    <div className="bg-gray-900 rounded-3xl">
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900 pt-10 rounded-3xl">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base leading-6 text-white font-bold">
                  {loaded ? projectData?.title : DynamicSkeletonText({ max: 3, min: 1 })}
                </h1>
                {/* Project Description */}
                <hr className="mt-2 mb-2 border-gray-700" />
                <span className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0'>Description</span>
                <div className={`mt-2 text-sm text-gray-300 overflow-hidden cursor-pointer ${isExpanded ? '' : 'line-clamp-3'}`} onClick={() => setIsExpanded(!isExpanded)}>
                  {loaded ? projectData?.description : DynamicSkeletonText({ max: 30, min: 10 })}
                </div>
                {/* Project Type */}
                <hr className="mt-2 mb-2 border-gray-700" />
                <span className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0'>Type</span>
                <div className="mt-2 text-sm text-gray-300 text-ellipsis overflow-hidden">
                  {loaded ? projectData?.projectType : DynamicSkeletonText({ max: 30, min: 10 })}
                </div>
                {/* Project Activity */}
                <hr className="mt-2 mb-2 border-gray-700" />
                <span className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0'>Activity</span>
                <div className="mt-2 text-sm text-gray-300 text-ellipsis overflow-hidden">
                  {loaded ? getProjectActivity(projectRepoAnalytics, projectData) : DynamicSkeletonText({ max: 30, min: 10 })}
                </div>
                {/* Project Compatibility */}
                <hr className="mt-2 mb-2 border-gray-700" />
                <span className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0'>Compatibility</span>
                <div className="mt-2 text-sm text-gray-300 text-ellipsis overflow-hidden">
                  {loaded ? getProjectWorksWithList(projectData).join(', ') : DynamicSkeletonText({ max: 30, min: 10 })}
                </div>
                <hr className="mt-2 mb-2 border-gray-700" />
                <div className='line-clamp-1'>
                  <SidePanelTagsContent tags={tags} loaded={loaded} tagBaseURL={tagBaseURL} />
                </div>
              </div>
              {/* <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                  <button
                    type="button"
                    className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Add user
                  </button>
                </div> */}
            </div>

            <div className="mt-8 flow-root ">

              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">

                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">

                  <div className="min-w-full divide-y divide-gray-700 px-4">

                    <div className="divide-gray-800 divide-y-4">

                      <span className="text-white -my-4">Developer</span>
                    </div>

                    <AuthorDescription
                      name={projectData?.user?.username}
                      link={`/users/${projectData?.user.username}`}
                      imageUrl={`https://avatars.githubusercontent.com/u/${projectData?.user.githubID}?v=4`} loaded={loaded}
                    />
                  </div>

                </div>
              </div>
              <div className="flex justify-end py-4 ">
                {/* Project Last Updated */}
                <hr className="mt-2 mb-2 border-gray-700" />
                <span className='whitespace-nowrap pl-4 pr-3 text-xs text-gray-500'>Content Updated: </span>
                {loaded && projectData ?
                  <time dateTime={new Date(projectData.updatedAt).toISOString()} className="text-xs text-gray-500 ">
                    {moment(projectData.updatedAt).fromNow()}
                  </time>
                  :
                  DynamicSkeletonText({ max: 30, min: 10 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


