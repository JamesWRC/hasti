


export interface RepositoryData {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
}


export interface GitHubAddRepoRequest {
    action: string;
    installation: {
        id: number;
        account: {
            login: string;
            id: number;
        };
    };
    repositories_added: RepositoryData[];
    repositories_removed: RepositoryData[];
}
