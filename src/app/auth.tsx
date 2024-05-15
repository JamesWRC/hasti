import NextAuth, { User } from "next-auth"
import GitHub from "next-auth/providers/github"
import { Session } from 'next-auth';
import { JWTBodyRequest, JWTBodyResponse } from '@/backend/interfaces/user/request';
import axios from 'axios';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string

const AUTH_GITHUB_ID = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_ID : process.env.DEV_AUTH_GITHUB_ID;
const AUTH_GITHUB_SECRET = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_SECRET : process.env.DEV_AUTH_GITHUB_SECRET;

// Get JWT from backend
const getTokenFromAPIServer = async (provider: string, user: any) => {

    const JWTBodyRequest: JWTBodyRequest = {
        provider,
        user
    }
    console.log("JWTBodyRequest req", JWTBodyRequest)

    const imageResponse = await axios({
        url: `${process.env.API_URL}/api/v1/auth/jwt`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JWTBodyRequest,
        timeout: 10000,
        timeoutErrorMessage: 'Request timed out. Please try again.',
      })

    const data:JWTBodyResponse = imageResponse.data;
    console.log("JWTBodyRequest resp", data)
    return data;

}

export const authOptions = { 
    providers: [ GitHub({ clientId: AUTH_GITHUB_ID, clientSecret: AUTH_GITHUB_SECRET }) ],
    pages: {
        // signIn: "/register",
        // signOut: "/a",
        // error: "/api/auth/error", // Error code passed in query string as ?error=
        // verifyRequest: "/api/auth/verify-request", // (used for check email message)
        // newUser: null // If set, new users will be directed here on first sign in
        
      },
    session: {
        jwt: true,
        maxAge: 30 * 24 * 60 * 60,
      },
      jwt: {
        secret: JWT_SECRET_KEY,
      },
      callbacks: {
        async signIn({ user, account, profile, email, credentials }: {user: User, account: any, profile?: any, email?: any, credentials: any}) {
            console.log("SBBBB user: ", user)
            console.log("SBBBB account: ", account)
            console.log("SBBBB profile: ", profile)
            console.log("SBBBB email: ", email)
            console.log("SBBBB credentials: ", credentials)

            if (account.provider === 'github') {    
                const githubUser = {
                    id: profile.id,
                    username: profile.login,
                    name: profile.name,
                    image: profile.avatar_url,
                }
                user.name = githubUser.username
                user.githubID = githubUser.id
                user.image = githubUser.image
                const authenticatedUser:JWTBodyResponse = await getTokenFromAPIServer('github', githubUser);
                
                user.jwt = authenticatedUser.jwt;
                user.id = authenticatedUser.id;

                return true
            }
        
            return false;
          },
        async jwt({ token, user, account }: {token: any, user: any, account: any}) {

            if (account) {
                token.uid = account.id;
                token.jwt = user.jwt;
                token.githubID = user.githubID;
            }
            return token;
        },
        async session({ session, token, user }: {session: Session, token: any, user: any}) {
            
            // session.jwt = token.jwt

            if (session?.user) {
                session.user.id = token.sub;
                session.user.jwt = token.jwt;
                session.user.githubID = token.githubID;
                // session.token = token;
              }
            return session
        },
        async redirect({ url, baseUrl }: {url: string, baseUrl: string}) {
    //this is the default behavior
    // Allows relative callback URLs
    if (url.startsWith("/")) return `${baseUrl}${url}`
    // Allows callback URLs on the same origin
    else if (new URL(url).origin === baseUrl) return url
    return baseUrl        }
    },
}

// @ts-expect-error.
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)