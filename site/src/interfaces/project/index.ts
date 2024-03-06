// Used for differentiating between theme and integration projects and other projcts in the future
export enum ProjectType {
  THEME = "theme",
  INTEGRATION = "integration",
}


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


export function getProjectType(projectType: string): ProjectType {
  switch (projectType) {
    case ProjectType.THEME.toString():
      return ProjectType.THEME
    case ProjectType.INTEGRATION.toString():
      return ProjectType.INTEGRATION
    default:
      return ProjectType.INTEGRATION
  }
}


export function getProjectLink(project: Project) {
  if (project.projectType === ProjectType.THEME) {
    return 'themes/' + project.href;
  } else if (project.projectType === ProjectType.INTEGRATION) {
    return 'integrations/' + project.href;
  }
}