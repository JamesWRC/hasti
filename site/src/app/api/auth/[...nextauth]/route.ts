
import { handlers } from "@/app/auth"
export const { GET, POST } = handlers

// import NextAuth, { TokenSet } from "next-auth"
// import GithubProvider from "next-auth/providers/github"
// import { Session } from 'next-auth';


// export const authOptions = {
//   // Configure one or more authentication providers
//   providers: [
//     GithubProvider({
//       clientId: "Iv1.0ab7083a89043f56",
//       clientSecret: "d2a0eae81dadce497b70c20c251ee60953de8bbc",
      
//     }),
//     // ...add more providers here
//   ],
//   callbackUrl: "/register",
// }

// const handler=NextAuth(authOptions)
// export {handler as GET , handler as POST}


// import NextAuth, { TokenSet } from "next-auth"
// import GithubProvider from "next-auth/providers/github"
// import { Session } from 'next-auth';


// export const authOptions = {
//   // Configure one or more authentication providers
//   providers: [
//     GithubProvider({
//       clientId: "Iv1.0ab7083a89043f56",
//       clientSecret: "d2a0eae81dadce497b70c20c251ee60953de8bbc",
      
//     }),
//     // ...add more providers here
//   ],
//   callbackUrl: "/register",
//   session: {
//     jwt: true,
//     maxAge: 30 * 24 * 60 * 60,
//   },
//   callbacks: {
//     async session({ session, token }: {session: Session, token: any}) {
//       session.user = token.user;
//       return session;
//     },
//     async jwt({ token, user }: {token: TokenSet, user: any}) {
//       if (user) {
//         token.user = user;
//       }
//       return token;
//     },
//   },
// }
// export default NextAuth(authOptions)