'use client'
import { useSession } from 'next-auth/react';
import ProjectGrid from '@/frontend/components/project/ProjectGrid';
import { ProjectType } from '@/backend/interfaces/project';
export default function Page({ params }: { params: { developer: string } }) {
  const { data: session, status } = useSession()
  const developer:string = params.developer
  return(
    <ProjectGrid projectParams={{username:developer, type:ProjectType.THEME}} allowLoadMore={false}/>

  )
}
