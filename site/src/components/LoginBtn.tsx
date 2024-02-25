// import { getServerSession } from "next-auth/next"
import { Session } from '@/interfaces/user'

import { auth } from "@/app/auth"
import { SignIn, SignOut } from "./authComp"

export default async function Component() {
  const session:Session = await auth()
  // const session = 'a'
  
  console.log("session?.user", session)

  if (session) {
    console.log(session)
    return (
      <a
      className="rounded-md flex items-center gap-x-4 text-sm mt-6 p-2 font-semibold leading-6 text-gray-100 hover:bg-gray-50"
      >
      <img
        className="h-8 w-8 rounded-full bg-gray-50"
        src={session.user.image}
        alt=""
      />
      {/* <span className="sr-only">Your profile {session.user.name}</span> */}
      {/* <span aria-hidden="true">{session.user}</span> */}
      
      <SignOut session={session}/>

    </a>
  
    )
  }
  return (
    <div className="pt-8"><SignIn /></div>
  )
}
