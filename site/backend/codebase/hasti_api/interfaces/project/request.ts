import { Project, User } from "@prisma/client";

export const MAX_FILE_SIZE:number = 10 * 1024 * 1024 // 10MB. this is actually 10.48576MB... but let's just call it 10MB :)
export interface AddProjectResponse {
    success: boolean;
    message: string;
    extraInfo?: string;
    project?: Project;
}


export interface UserProject {
    user: User,
    project: Project
  }
export interface GetProjectResponse {
    success: boolean;
    userProjects: UserProject[] | null;
}