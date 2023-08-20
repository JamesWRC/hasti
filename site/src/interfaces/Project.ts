// Used for differentiating between theme and integration projects and other projcts in the future
export enum ProjectType {
    THEME = "theme",
    INTEGRATION = "integration",
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
  

  export function getProjectLink(post: any) {
    if (post.projectType === ProjectType.THEME) {
        return 'themes/' + post.href;
    }else if (post.projectType === ProjectType.INTEGRATION) {
        return 'integrations/' + post.href;
    }
}