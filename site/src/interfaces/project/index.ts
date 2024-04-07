// Used for differentiating between theme and integration projects and other projects in the future

import { ProjectType } from "@/backend/interfaces/project";
import type { Project } from  '@/backend/interfaces/project';
import { UserProject } from "@/backend/interfaces/project/request";



export interface Author {
  name: string;
  imageUrl: string;
  link: string;
}

export interface LoadProjects {
  reqStatus: string,
  loadedProjects: UserProject[] | null

}


export function getProjectLink(project: Project) {
  if (project.projectType === ProjectType.THEME) {
    return 'themes/' + project.title;
  } else if (project.projectType === ProjectType.INTEGRATION) {
    return 'integrations/' + project.title;
  }
}