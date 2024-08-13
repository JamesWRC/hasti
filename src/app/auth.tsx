import NextAuth, { User } from "next-auth"
import GitHub from "next-auth/providers/github"
import { Session } from 'next-auth';
import { JWTBodyRequest, JWTBodyResponse, ReAuthenticateRequest } from '@/backend/interfaces/user/request';
import axios from 'axios';
import { AuthCheckType, ReAuthenticateUserResponse } from "@/backend/interfaces/auth";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string

const AUTH_GITHUB_ID = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_ID : process.env.DEV_AUTH_GITHUB_ID;
const AUTH_GITHUB_SECRET = process.env.NODE_ENV === 'production' ? process.env.AUTH_GITHUB_SECRET : process.env.DEV_AUTH_GITHUB_SECRET;

// Get JWT from backend
const getTokenFromAPIServer = async (provider: string, user: any) => {

  const JWTBodyRequest: JWTBodyRequest = {
    provider,
    user,
  }

  const authResponse = await axios({
    url: `${process.env.API_URL}/api/v1/auth/jwt`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JWTBodyRequest,
    timeout: 10000,
    timeoutErrorMessage: 'Request timed out. Please try again.',
  })

  const data: JWTBodyResponse = authResponse.data;
  return data;

}

// Authenticate with JWT and get user data
const reAuthenticateUser = async (jwt: string) => {

  const authResponse = await axios({
    url: `${process.env.API_URL}/api/v1/auth/reAuth`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${jwt}`, /// This is the JWT token. JWT already has the Bearer prefix.
    },
    timeout: 10000,
    timeoutErrorMessage: 'Request timed out. Please try again.',
  })

  return authResponse.data;

}

export const authOptions = {
  providers: [GitHub({ clientId: AUTH_GITHUB_ID, clientSecret: AUTH_GITHUB_SECRET })],
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
    async signIn({ user, account, profile, email, credentials }: { user: User, account: any, profile?: any, email?: any, credentials: any }) {

      if (account.provider === 'github') {
        const githubUser = {
          id: profile.id,
          node_id: profile.node_id,
          username: profile.login,
          name: profile.name,
          image: profile.avatar_url,
          ghu_token: account.access_token
        }
        user.name = githubUser.username
        user.githubID = githubUser.id
        user.image = githubUser.image
        const authenticatedUser: JWTBodyResponse = await getTokenFromAPIServer('github', githubUser);

        user.jwt = authenticatedUser.jwt;
        user.id = authenticatedUser.id;
        user.type = authenticatedUser.type;

        return true
      }

      return false;
    },
    async jwt({ token, user, account }: { token: any, user: any, account: any }) {

      if (account) {
        token.uid = account.id;
        token.jwt = user.jwt;
        token.githubID = user.githubID;
        token.user = user;
      }

      if (token.jwt) {

        // If missing data, reauthenticate
        if (!token.type) {
          const reauthResponse: ReAuthenticateUserResponse = await reAuthenticateUser(token.jwt);
          if (reauthResponse.success && reauthResponse.check === AuthCheckType.ALL_OK) {
            token.jwt = reauthResponse.jwt;
            token.type = reauthResponse.user.type;
          }
        }
      }
      return token;
    },
    // JWT() is called before session() and before the user is logged in or session is read.
    async session({ session, token, user }: { session: Session, token: any, user: any }) {

      session.user.id = token.sub;
      session.user.jwt = token.jwt;
      session.user.githubID = token.githubID;
      session.user.type = token.type;

      return session
    },
    async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
      //this is the default behavior
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
}

// @ts-expect-error.
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)