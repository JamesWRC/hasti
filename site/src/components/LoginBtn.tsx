// import { getServerSession } from "next-auth/next"

import { auth } from "@/app/auth"
import { SignIn, SignOut } from "./authComp"
import { Session } from 'next-auth';

export default async function Component() {
  const session:Session|null = await auth()
  
  if (session) {
    return (
      <a
      className="rounded-md flex items-center gap-x-4 text-sm mt-6 p-2 font-semibold leading-6 text-gray-100 hover:bg-gray-50"
      href='/user/account'
      >
      <img
        className="h-8 w-8 rounded-full bg-gray-50"
        src={session.user.image}
        alt=""
      />
      {/* <span className="sr-only">Your profile {session.user.name}</span> */}
      {/* <span aria-hidden="true">{session.user}</span> */}
      
      {/* <SignOut session={session}/> */}
      <div className="">

        <button>{session.user.name}</button>

      </div>
    </a>
  
    )
  }
  return (
    <div className="pt-8"><SignIn /></div>
  )
}
