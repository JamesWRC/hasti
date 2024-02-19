// import { getServerSession } from "next-auth/next"
// import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect } from "react"
import { auth } from "@/app/auth"
import { useSession } from "next-auth/react"
import { SignIn, SignOut } from "./authComp"

export default async function Component() {
  const session = await auth()
  // const session = 'a'
  console.log("session?.user", session)

  if (session) {
    console.log(session)
    return (
      <a
      className="rounded-md flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-100 hover:bg-gray-50"
    >
      <img
        className="h-8 w-8 rounded-full bg-gray-50"
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt=""
      />
      <span className="sr-only">Your profile </span>
      <span aria-hidden="true">Tom Cook | {session.user?.email}</span>
      <SignOut/>
    </a>
  
    )
  }
  return (
    <><SignIn /></>
  )
}
