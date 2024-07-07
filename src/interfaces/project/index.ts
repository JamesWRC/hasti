// Used for differentiating between theme and integration projects and other projects in the future

import { ProjectType } from "@/backend/interfaces/project";
import type { Project } from  '@/backend/interfaces/project';
import { ProjectWithUser, ProjectAllInfo } from "@/backend/clients/prisma/client";
import { GetProjectsQueryParams } from "@/backend/interfaces/project/request";


export interface Author {
  name: string;
  imageUrl: string;
  link: string;
}

export interface LoadProjects {
  reqStatus: string,
  projects: ProjectWithUser[] | ProjectAllInfo[] | null
  setSearchProps: React.Dispatch<React.SetStateAction<GetProjectsQueryParams>>
}


export function getProjectTypeURL(project: Project | ProjectWithUser | ProjectAllInfo | null) {
  if(project === null) return '/404';

  let typePrefix = '';
  if (project?.projectType === ProjectType.THEME) {
    typePrefix = '/themes'
  } else if (project?.projectType === ProjectType.INTEGRATION) {
    typePrefix = '/integrations'
  }

  return typePrefix;
}

export function getProjectLink(project: ProjectWithUser) {
  if(project === null) return '/404';
  
  let typePrefix = getProjectTypeURL(project)

  return `${typePrefix}/${project.user.username}/${project.title}`;
}
