import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { Session } from 'next-auth';
import { HastiSession } from "@/interfaces/user";

const secretKey = 'your-secret-key';
let jwtToken = '';
let _user= undefined;
// Get JWT from backend
const getTokenFromYourAPIServer = async (provider: string, user: any) => {

    // Make request to your API
    const response = await fetch(`${process.env.API_URL}/api/auth`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            provider,
            user,
        }),
    });

    const data = await response.json();

    // Your logic here
    return data.token;

    // Your logic here
    return 'jwt-token';
}

export const authOptions = { 
    providers: [ GitHub ],
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
        secret: "your-secret-key",
      },
      callbacks: {
        async signIn({ user, account, profile, email, credentials }: {user: any, account: any, profile: any, email: any, credentials: any}) {
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
                    avatar: profile.avatar_url,
                }
                user.name = githubUser.username
                user.id = githubUser.id
                user.image = githubUser.avatar
                user.jwt = await getTokenFromYourAPIServer('github', githubUser);
                
                return true
            }
        
            return false;
          },
        async jwt({ token, user, account, profile }: {token: any, user: any, account: any, profile: any}) {

            if (account) {
                token.uid = account.id;
                token.jwt = user.jwt;
            }
            return token;
        },
        async session({ session, token, user }: {session: HastiSession, token: any, user: any}) {
            
            session.jwt = token.jwt
            session.user.id = token.id
            if (session?.user) {
                session.user.id = token.sub;
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
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)