import { Octokit, App } from "octokit";
import { createAppAuth } from "@octokit/auth-app";
import { createTokenAuth  } from "@octokit/auth-token";
import fs from 'fs';
import 'dotenv/config'
import { getGitHubUserToken } from "@/backend/app/helpers/user";
import { User } from "@/backend/app/interfaces/user";
                
const AUTH_GITHUB_APP_ID = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_APP_ID : process.env.DEV_AUTH_GITHUB_APP_ID;
const AUTH_GITHUB_ID = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_ID : process.env.DEV_AUTH_GITHUB_ID;
const AUTH_GITHUB_SECRET = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_SECRET : process.env.DEV_AUTH_GITHUB_SECRET;
const PRIVATE_KEY='./dev_GitHub_app.pem'

function getAppID(){
    if(AUTH_GITHUB_APP_ID === undefined){
        throw new Error("AUTH_GITHUB_APP_ID is undefined")
    }

    return AUTH_GITHUB_APP_ID
}

function getPrivateKey(){
    if(PRIVATE_KEY === undefined){
        throw new Error("PRIVATE_KEY is undefined")
    }
    // Read the private key from the file synchronously
    const privateKey = fs.readFileSync(PRIVATE_KEY, 'utf-8');
    return privateKey.trim(); // Trim any leading/trailing whitespace}
}

function getGitHubID(){
    if(AUTH_GITHUB_ID === undefined){
        throw new Error("AUTH_GITHUB_ID is undefined")
    }
    return AUTH_GITHUB_ID
}

function getGitHubSecret(){
    if(AUTH_GITHUB_SECRET === undefined){
        throw new Error("AUTH_GITHUB_SECRET is undefined")
    }

    return AUTH_GITHUB_SECRET
}


// Initialize Octokit app
// Create GitHub API Octokit instance with app authentication
const installationOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: parseInt(getAppID()),
      privateKey: getPrivateKey(),
    },
  });


export async function getGitHubUserAuth(user:User):Promise<Octokit> {
    const ghuToken:string = await getGitHubUserToken(user.ghuToken)
    const auth = createTokenAuth(ghuToken)
    const authData = await auth()
    
    // Create Octokit instance with authentication
    return new Octokit({
        auth: authData.token,
    });

}
  

export default installationOctokit;