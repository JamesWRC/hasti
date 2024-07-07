'use client'
import { useSession } from 'next-auth/react';
import ProjectGrid from '@/frontend/components/project/ProjectGrid';
import { ProjectType } from '@/backend/interfaces/project';
import { GetProjectsQueryParams } from '@/backend/interfaces/project/request';
export default function Page({ params }: { params: { projectType: string, developer: string } }) {
  const { data: session, status } = useSession()
  const developer:string = params.developer
  const currProjectType = params.projectType.substring(0, params.projectType.length-1) as ProjectType

  let projectProps:GetProjectsQueryParams = {username:developer, type:currProjectType}
  let pageTitle:string = params.projectType
  if(params.projectType === 'users'){
    projectProps = {username:developer}
    pageTitle = 'projects'
  }


  return(
    <div>
      <h1 className='text-xl mx-8 my-8 font-bold'>Showing <u className='font-black'>{developer}</u>&apos;s {pageTitle} </h1>
      <ProjectGrid projectParams={projectProps} allowLoadMore={false}/>
    </div>

  )
}
