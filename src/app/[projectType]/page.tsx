'use strict'
'use client'
import { ProjectType, getProjectTypePath } from "@/backend/interfaces/project";
import FeaturedGroup from "@/frontend/components/store/FeaturedGroup";
import PaginationPanel from "@/frontend/components/store/PaginationPanel";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllProjectTypes } from '../../../backend/codebase/app/interfaces/project/index';
import Search from "@/frontend/components/ui/search/Search";

// function renderThemesGrid(){
//   return (<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 px-8">
//     <DescriptionItem/>
//     <DescriptionItem/>
//     <DescriptionItem/>
//     <DescriptionItem/>
//     <DescriptionItem/>
//     <DescriptionItem/>
//     <DescriptionItem/>
//     <DescriptionItem/>
//     <DescriptionItem/>
//     <DescriptionItem/>
//     <DescriptionItem/>
//     <DescriptionItem/>
//   </div>
//   )
// }

export default function Page({ params }: { params: { projectType: string } }) {
  const router = useRouter()

  const searchParams = useSearchParams()
  // If a page number is specified in the query string, then we are on a paginated page,
  // otherwise we are on the front page and should show the featured group.
  const pageNumber = searchParams?.get('page')
  let isFrontPage = false
  if(pageNumber){
    if(parseInt(pageNumber) > 1){
      isFrontPage = false
    } else {
      isFrontPage = true
    }
  } else {
    isFrontPage = true
  }

  let projectTypeString = params.projectType
  if (projectTypeString.endsWith('s')) {
    projectTypeString = projectTypeString.substring(0, projectTypeString.length - 1)
  }

  let pageTitle = `Popular ${projectTypeString}s`
  if (projectTypeString === 'other') {
    pageTitle = 'Other Popular Projects'
  }
  const currProjectType:ProjectType = projectTypeString as ProjectType
  // check if the project type is valid and if not, redirect to 404. Will check if passed in type is valid or if it is a valid type without the last character
  if (!(getAllProjectTypes(false).includes(params.projectType as ProjectType) || getAllProjectTypes(false).includes(currProjectType))) {
    router.push('/404')
    return null
  }

    return (
      <div className="mt-24 2xl:mt-8">
                    <Search/>

        {isFrontPage ? 
        <div className="pl-0">
          <FeaturedGroup groupTitle={pageTitle} type={currProjectType} /> 
        </div>: null}
      
      {/* {renderThemesGrid()} */}
      <PaginationPanel projectType={currProjectType}/>
      {/* <button
        type="button"
        className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
      >
        
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
          />
        </svg>
        <span className="mt-2 block text-sm font-semibold text-gray-900">WELCOME</span>
      </button> */}
      </div>
      
    )
  }
  

  