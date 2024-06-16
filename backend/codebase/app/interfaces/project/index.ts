import { Project, User } from '@prisma/client';
export type {Project} from "@prisma/client";
export type {ProjectWithUser, ProjectAllInfo} from '@/backend/clients/prisma/client';

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


export enum IoTClassifications {
    CLOUD_POLLING = "cloud_polling",
    LOCAL_POLLING = "local_polling",
    CLOUD_PUSH = "cloud_push",
    LOCAL_PUSH = "local_push",
    UNKNOWN = "unknown", // this is the default, Home Assistant calls this 'Assumed State'

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

export function getAllHaInstallTypes(caseSensitive:Boolean=true): string[] {
    const ret: string[] = [];
    const tprojValues = Object.values(HAInstallType);
    for(const t in tprojValues){
      if(caseSensitive){
        ret.push(tprojValues[t][0].toUpperCase() + tprojValues[t].slice(1)) 
      }else{
        ret.push(tprojValues[t]);
      }
    }
    return ret;
  }

export function getAllIoTClassificationTypes(caseSensitive:Boolean=true): string[] {
    const ret: string[] = [];
    const tprojValues = Object.values(IoTClassifications);
    for(const t in tprojValues){
      if(caseSensitive){
        ret.push(tprojValues[t][0].toUpperCase() + tprojValues[t].slice(1)) 
      }else{
        ret.push(tprojValues[t]);
      }
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

export function getIoTClassificationType(classification: string): IoTClassifications {
    const values = Object.values(IoTClassifications);
    for(const t in values){
        if(values[t] === classification.toLowerCase()){
            return values[t];
        }
    }
    // If the classification is not found, return unknown
    return IoTClassifications.UNKNOWN;
  }


// Allowed HTML in content
export const allowedContentHTMLTags:string[] = [
  'div', 'span', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'b', 'i', 'em', 'strong', 'small', 'strike', 'del', 'ins',
  'ul', 'ol', 'li', 'a', 'img', 'code', 'pre',
  'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot',
  'p', 'br', 'hr', 'blockquote', 'sub', 'sup', 'details'
];
