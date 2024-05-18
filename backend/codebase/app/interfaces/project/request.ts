import { Project } from "@prisma/client";
import type { ProjectWithUser, ProjectType, ProjectAllInfo } from '@/backend/interfaces/project';

export const MAX_FILE_SIZE:number = 10 * 1024 * 1024 // 10MB. this is actually 10.48576MB... but let's just call it 10MB :)

export enum ProjectAddMethod {
    REPO_SELECT = 'repo_select',
    URL_IMPORT = 'url_import'
}

export function getProjectAddMethod(method: string): ProjectAddMethod|null {
    const values = Object.values(ProjectAddMethod);
    for(const t in values){
        if(values[t] === method.toLowerCase()){
            return values[t];
        }
    }

    return null
}


export function getAllProjectAddMethods(caseSensitive:Boolean=true): string[] {
    const ret: string[] = [];
    const tValues = Object.values(ProjectAddMethod);
    for(const t in tValues){
        if(caseSensitive){
          ret.push(tValues[t][0].toUpperCase() + tValues[t].slice(1)) 
        }else{
          ret.push(tValues[t]);
        }
    }
    return ret;
  }
export interface AddProjectResponse {
    success: boolean;
    message: string;
    extraInfo?: string;
    project?: Project;
}


export interface GetProjectsResponse {
    success: boolean;
    userProjects: ProjectWithUser[] | ProjectAllInfo[] | null;
}


export interface GetProjectsQueryParams{
    limit?: number;
    projectID?: string;
    type?: ProjectType;
    cursor?: string;
    userID?: string;
    username?: string;
    githubUserID?: number;
    checkImported?: boolean;
    ownedOrImported?: boolean;
    projectTitle?: string;
    orderBy?: 'createdAt' | 'updatedAt' | 'title' | 'author';
    orderDirection?: 'asc' | 'desc';
    allContent?: boolean;

}

export interface DeleteProjectResponse {
    success: boolean;
    projectID: string;
}

export interface ChangeProjectOwnershipResponse {
    success: boolean;
    projectID: string;
    newOwnerID: string;
}
// export interface GetProjectContentResponse {
//     success: boolean;
//     projectAllInfo: ProjectAllInfo;
// }