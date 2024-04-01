import { Project } from "@prisma/client";

export interface AddProjectResponse {
    success: boolean;
    message: string;
    extraInfo?: string;
    project?: Project;
}