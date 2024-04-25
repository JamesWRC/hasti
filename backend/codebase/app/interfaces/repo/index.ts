export type {Repo} from "@prisma/client";

export interface RepositoryData {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
}

export interface GHAppInstallation {
    id: number;
    account: { // User or Org
        login: string;
        id: number;
        type: string;
    };
}

export interface GHAppSenderWHSender {
    id: number;
    login: string;
    node_id: string;
    type: string;
}
// GitHub Add Repo Request from webhook
export interface GitHubRepoRequest { 
    action: string;
    installation: GHAppInstallation;
    sender: GHAppSenderWHSender;
    repositories_added: RepositoryData[];
    repositories_removed: RepositoryData[];
}


export enum RepoOwnerType {
    USER = 'user',
    ORG = 'organization'
}

export function getRepoOwnerType(type: string): RepoOwnerType|null {
    const values = Object.values(RepoOwnerType);
    for(const t in values){
        if(values[t] === type.toLowerCase()){
            return values[t];
        }
    }

    return null
}


export function getAllProjectAddMethods(caseSensitive:Boolean=true): string[] {
    const ret: string[] = [];
    const tValues = Object.values(RepoOwnerType);
    for(const t in tValues){
        if(caseSensitive){
          ret.push(tValues[t][0].toUpperCase() + tValues[t].slice(1)) 
        }else{
          ret.push(tValues[t]);
        }
    }
    return ret;
  }
