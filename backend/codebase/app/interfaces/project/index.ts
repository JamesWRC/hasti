import { Project, User } from '@prisma/client';
export type {Project} from "@prisma/client";
export type {ProjectWithUser} from '@/backend/app/clients/prisma/client';

// Used for differentiating between theme and integration projects and other projects in the future
export enum ProjectType {
    THEME = "theme",
    INTEGRATION = "integration",
    OTHER = "other"
  }

export enum HAInstallType {
    OS = "os",
    CONTAINER = "container",
    CORE = "core",
    SUPERVISED = "supervised",
    ANY = "any",
  }

export function getAllProjectTypes(caseSensitive:Boolean=true): string[] {
    const ret: string[] = [];
    const tprojValues = Object.values(ProjectType);
    for(const t in tprojValues){
        if(caseSensitive){
          ret.push(tprojValues[t][0].toUpperCase() + tprojValues[t].slice(1)) 
        }else{
          ret.push(tprojValues[t]);
        }
    }
    return ret;
  }

export function getAllHaInstallTypes(): string[] {
    const ret: string[] = [];
    const tprojValues = Object.values(HAInstallType);
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
  
export function getHaInstallType(installType: string): HAInstallType {
    const values = Object.values(HAInstallType);
    for(const t in values){
        if(values[t] === installType.toLowerCase()){
            return values[t];
        }
    }
    // If the install type is not found, return any
    return HAInstallType.ANY;
  }

