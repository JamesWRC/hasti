

export interface JWTBodyRequest {
    provider: string,
    user: {
        id: number;
        name: string;
        username: string;
        avatar: string;
    };
}

export interface JWTContents {
    provider: string,
    user: {
        id: string;
        name: string;
        username: string;
        avatar: string;
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