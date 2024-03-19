// Used for differentiating between theme and integration projects and other projects in the future
export enum ProjectType {
    THEME = "theme",
    INTEGRATION = "integration",
    OTHER = "other"
  }

export function getAllProjectTypes(): string[] {
    const ret: string[] = [];
    const tprojValues = Object.values(ProjectType);
    for(const t in tprojValues){
        const upperType = tprojValues[t][0].toUpperCase() + tprojValues[t].slice(1)
        ret.push(upperType);
    }
    return ret;
  }


export function getProjectType(projectType: string): ProjectType {
    const tprojValues = Object.values(ProjectType);
    for(const t in tprojValues){
        if(tprojValues[t] === projectType.toLowerCase()){
            return tprojValues[t];
        }
    }
    // If the project type is not found, return other
    return ProjectType.OTHER;
  }
  