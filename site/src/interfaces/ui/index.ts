import { ProjectType } from "@/backend/interfaces/project";
import { GetProjectsQueryParams } from '@/backend/interfaces/project/request';


export interface FeaturedGroup extends GetProjectsQueryParams {
    groupTitle: string;
    groupType: ProjectType;
}