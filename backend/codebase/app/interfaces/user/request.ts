

// Important difference here from UserJWTPayload is that the id is a string.

// import { Repo } from "@/backend/interfaces/repo/index";
import { Project, Repo, Notification } from "@prisma/client";
import { User, UserType } from '@/backend/interfaces/user';

// Used to set up the JWT on initial login.
export interface JWTBodyRequest {
    provider: string,
    user: {
        id: number;
        node_id: string;
        name: string;
        username: string;
        image: string;
        ghu_token: string;
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
    type: UserType;
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

export interface ReAuthenticateRequest {
    userID: string;
}

// Admin routes
export interface AdminGetUsersResponse {
    success: boolean;
    users: User[] | null;
    totalUsers: number;
}

export interface GetUsersQueryParams {
    limit?: number;
    skip?: number;
    username?: string;
    orderBy?: 'createdAt' | 'updatedAt' | 'username';
    orderDirection?: 'asc' | 'desc';
}

export interface GetUsersResponse {
    success: boolean;
    users: User[] | null;
    totalUsers: number;
}
