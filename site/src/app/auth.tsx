import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { Session } from 'next-auth';

const secretKey = 'your-secret-key';
let jwtToken = '';
let _user, _account;
// Get JWT from backend
const getTokenFromYourAPIServer = async (provider: string, user: any) => {

    // Make request to your API
    const response = await fetch('http://localhost:3001/api/auth', {
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
    callbackUrl: "/register",
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
                user.name = githubUser.name
                user.image = githubUser.avatar
                
                user.accessToken = await getTokenFromYourAPIServer('github', githubUser)
                jwtToken = user.accessToken;
                _user = user;
                return true
            }
        
            return false;
          },
        async jwt({ token, account, profile }: {token: any, account: any, profile: any}) {
            // Make request to backend to generate JWT token
            console.log("jwt token: ", token)
            console.log("jwt account: ", account)
            console.log("jwt profile: ", profile)
        //   if (user) {
        //     token.user = { accessToken: user.accessToken };
        // //   }
        //   if (account) {
        //     token.accessToken = jwtToken
        //     // token.id = profile.id
        //   }
        //   token = { accessToken: jwtToken }

            return token;
        },
        async session({ session, token, user }: {session: Session, token: any, user: any}) {
            console.log("session session: ", session)
            console.log("session token: ", token)
            console.log("session user: ", user)
            session.accessToken = token.accessToken
            console.log("session session: ", session)
            session.user = _user
            // session.user.id = token.id
                     return session
        },
    },
}
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)