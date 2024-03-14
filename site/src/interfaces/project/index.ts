// Used for differentiating between theme and integration projects and other projects in the future

import { ProjectType } from "@/backend/interfaces/project";



export interface Author {
  name: string;
  imageUrl: string;
  link: string;
}

export interface Project {
  id: number;
  title: string;
  shortDesc: string;
  href: string;
  description: string;
  imageUrl: string;
  date: string;
  datetime: string;
  projectType: ProjectType;
  author: Author;
}


export function getProjectLink(project: Project) {
  if (project.projectType === ProjectType.THEME) {
    return 'themes/' + project.href;
  } else if (project.projectType === ProjectType.INTEGRATION) {
    return 'integrations/' + project.href;
  }
}