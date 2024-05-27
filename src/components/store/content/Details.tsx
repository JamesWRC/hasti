import { Project, ProjectAllInfo } from '@/backend/interfaces/project'
import { Tag } from '@/backend/interfaces/tag'
import SidePanelTagsContent from '@/frontend/components/store/content/SidePanelContent'
import AuthorDescription from '@/frontend/components/store/AuthorDescription';
import { LoadProjects } from '@/frontend/interfaces/project';
import { DynamicSkeletonText, DynamicSkeletonTitle } from "@/frontend/components/ui/skeleton/index";

const people = [
    { title: 'Developer', description: 'INSERT DEVELOPER NAME HERE'},
    // More people...
  ]
  
  export default function Details({project}:{project:LoadProjects | undefined}) {

    // get the single ProjectAllInfo from the array
    const projectData: ProjectAllInfo | null = project && project.projects ? project.projects[0] as ProjectAllInfo : null
    const loaded = project?.reqStatus === 'success'
    const isError = project?.reqStatus === 'error'
    console.log('isLoading side', loaded)
    const tags: Tag[] = projectData?.tags || []

    return (
      <div className="bg-gray-900 rounded-3xl">
        <div className="mx-auto max-w-7xl">
          <div className="bg-gray-900 py-10 rounded-3xl">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold leading-6 text-white font-bold">
                    {loaded ? projectData?.title : DynamicSkeletonText({max:3, min:1})}
                    </h1>
                    <hr className="mt-2 mb-2 border-gray-700"/>
                    <span className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0'>Description</span>
                  <div className="mt-2 text-sm text-gray-300">
                    {loaded ? projectData?.description : DynamicSkeletonText({max:30, min:10})}
                  </div>
                  <hr className="mt-2 mb-2 border-gray-700"/>

                  <SidePanelTagsContent tags={tags} loaded={loaded}/>
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
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="min-w-full divide-y divide-gray-700">

                      <div className="divide-y divide-gray-800">
                        <div className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">Developer</div>
                            <div className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              <AuthorDescription 
                              name={projectData?.user?.username} 
                              link={`https://github.com/${projectData?.user.username}`} 
                              imageUrl={`https://avatars.githubusercontent.com/u/${projectData?.user.githubID}?v=4`} loaded={loaded}/>
                            </div>
                        
                      </div>
                    </div>   
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  

