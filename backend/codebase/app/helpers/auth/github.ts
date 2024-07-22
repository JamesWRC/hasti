import { Octokit, App } from "octokit";
import { createAppAuth } from "@octokit/auth-app";
import { createTokenAuth  } from "@octokit/auth-token";
import fs from 'fs';
import 'dotenv/config'
import { getGitHubUserToken } from "@/backend/helpers/user";
import { User } from "@/backend/interfaces/user";
import prisma from "@/backend/clients/prisma/client";


const AUTH_GITHUB_APP_ID = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_APP_ID : process.env.DEV_AUTH_GITHUB_APP_ID;
const AUTH_GITHUB_ID = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_ID : process.env.DEV_AUTH_GITHUB_ID;
const AUTH_GITHUB_SECRET = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_SECRET : process.env.DEV_AUTH_GITHUB_SECRET;
const PRIVATE_KEY = process.env.NODE_ENV === 'production' ? '/home/node/app/PROD_GitHub_app.pem' : './dev_GitHub_app.pem';

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
    return privateKey; // Trim any leading/trailing whitespace}
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



export async function getGitHubAppAuth(): Promise<Octokit> {
    const auth = createAppAuth({
        appId: parseInt(getAppID()),
        privateKey: getPrivateKey(),
        clientId: getGitHubID(),
        clientSecret: getGitHubSecret(),
      });
      
      // Retrieve JSON Web Token (JWT) to authenticate as app
      const appAuthentication = await auth({ type: "app" });
      return new Octokit({
        auth: appAuthentication.token,
        });
}


export async function constructUserOctoKitAuth(token:string):Promise<Octokit>{
    const auth = createTokenAuth(token)
    const authData = await auth()
    
    // Create Octokit instance with authentication
    return new Octokit({
        auth: authData.token,
    });
}
  
export async function getGitHubUserAuth(user:User):Promise<Octokit> {
    // check if the user object has a ghuToken
    let encryptedGHUToken:string = user.ghuToken
    console.log('encryptedGHUToken', encryptedGHUToken)

    if(user.ghuToken === undefined || encryptedGHUToken.length <= 0){
        console.log('No token found in user object')
        // if not, get the token from the database
        encryptedGHUToken = await prisma.user.findUnique({
            where: {
                githubID: user.githubID
            },
            select: {
                ghuToken: true
            }
        }).then((u) => {
            if(u){
                console.log('u.ghuToken', u.ghuToken)
                return u.ghuToken
            }
            console.log('No token found in database')
            return ''
        })
    }

    console.log('encryptedGHUToken', encryptedGHUToken)
  
    const ghuToken:string = getGitHubUserToken(encryptedGHUToken)
    return constructUserOctoKitAuth(ghuToken)

}