

// Important difference here from UserJWTPayload is that the id is a string.

import { RepositoryData } from "@/interfaces/repo/index";
import { Project, Repo, Notification } from "@prisma/client";

// Used to set up the JWT on initial login.
export interface JWTBodyRequest {
    provider: string,
    user: {
        id: number;
        name: string;
        username: string;
        image: string;
    };
}

export interface JWTBody {
    provider: string,
    user: {
        id: string;
        name: string;
        username: string;
        image: string;
        githubID: number;
    };
}

export interface JWTBodyResponse {
    success: boolean;
    jwt: string;
    id: string;
}

export interface  GitHubUserTokenRequest {
    code: string;
    installation_id: string;
    state: string;
}

export interface UserRepoCountResponse {
    success: boolean;
    count: number;
}


export interface UserReposResponse {
    success: boolean;
    repos: Repo[];
}

export interface UserProjectCountResponse {
    success: boolean;
    count: number;
}

export interface UserNotificationCountResponse {
    success: boolean;
    count: number;
}

export interface UserNotificationsResponse {
    success: boolean;
    notifications: Notification[];
}

export interface GetProjectsQueryParams {
    limit?: number;
}