// Used for differentiating between theme and integration projects and other projects in the future

import { ProjectType } from "@/backend/interfaces/project";
import type { Project } from  '@/backend/interfaces/project';
import { ProjectWithUser } from "@/backend/clients/prisma/client";


export interface Author {
  name: string;
  imageUrl: string;
  link: string;
}

export interface LoadProjects {
  reqStatus: string,
  projects: ProjectWithUser[] | null

}


export function getProjectLink(project: ProjectWithUser) {
  if (project?.projectType === ProjectType.THEME) {
    return 'themes/' + project.title;
  } else if (project?.projectType === ProjectType.INTEGRATION) {
    return 'integrations/' + project.title;
  }
}