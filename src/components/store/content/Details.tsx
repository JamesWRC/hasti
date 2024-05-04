import { Project, ProjectAllInfo } from '@/backend/interfaces/project'
import { Tag } from '@/backend/interfaces/tag'
import SidePanelTagsContent from '@/frontend/components/store/content/SidePanelContent'
import AuthorDescription from '@/frontend/components/store/AuthorDescription';

const people = [
    { title: 'Developer', description: 'INSERT DEVELOPER NAME HERE'},
    // More people...
  ]
  
  export default function Details({project}:{project:ProjectAllInfo | undefined}) {
    const tags: Tag[] = project?.tags || []

    return (
      <div className="bg-gray-900 rounded-3xl">
        <div className="mx-auto max-w-7xl">
          <div className="bg-gray-900 py-10 rounded-3xl">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold leading-6 text-white font-bold">
                    {project?.title}
                    </h1>
                    <hr className="mt-2 mb-2 border-gray-700"/>
                    <span className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0'>Description</span>
                  <p className="mt-2 text-sm text-gray-300">
                    {project?.description} adsa sad asd asfasfasfasf fwef ew dasd asdas fd asfwfqwfqw fqwfq wfqwfqqwqwfq wwqqwf qf qwf qwf qf q
                  </p>
                  <hr className="mt-2 mb-2 border-gray-700"/>

                  <SidePanelTagsContent tags={tags}/>
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
                    <table className="min-w-full divide-y divide-gray-700">

                      <tbody className="divide-y divide-gray-800">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">Developer</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              <AuthorDescription 
                              name={project?.user?.username} 
                              link={`https://github.com/${project?.user.username}`} 
                              imageUrl={`https://avatars.githubusercontent.com/u/${project?.user.githubID}?v=4`} loaded={true}/>
                            </td>
                        {/* {project?.tags.map((tag) => (
                          <tr key={tag.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">{tag.name}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{tag.type}</td>
                            
                          </tr>
                        ))} */}
                      </tbody>
                    </table>   
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  