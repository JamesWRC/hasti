import { Project } from "@prisma/client";
import type { ProjectWithUser, ProjectType } from '@/interfaces/project';

export const MAX_FILE_SIZE:number = 10 * 1024 * 1024 // 10MB. this is actually 10.48576MB... but let's just call it 10MB :)
export interface AddProjectResponse {
    success: boolean;
    message: string;
    extraInfo?: string;
    project?: Project;
}


export interface GetProjectsResponse {
    success: boolean;
    userProjects: ProjectWithUser[] | null;
}


export interface GetProjectsQueryParams {
    limit?: number;
    type?: ProjectType;
    cursor?: string;
    userID?: string;
    username?: string;
    githubUserID?: number;

}