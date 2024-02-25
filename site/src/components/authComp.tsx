import { signIn, signOut } from "@/app/auth"
import React from 'react';
import { MarkGithubIcon } from '@primer/octicons-react';
import { HastiSession } from "@/interfaces/user";



export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      action={async () => {
        "use server"
        await signIn(provider, { redirect: true, callbackUrl: "http://localhost:3000/register" })
      }}
    >
        {/* <div>

            <button {...props} type="submit" className="button" control-id="ControlID-1">
            <img loading="lazy" height="24" width="24" id="provider-logo" src="https://authjs.dev/img/providers/github.svg"></img>
                  <span>Sign in with GitHub</span>
            </button>
        </div> */}


      <button className="flex items-center hover:bg-gray-700 text-white font-bold py-2 pl-3 -ml-1 rounded-2xl focus:outline-none focus:shadow-outline-gray active:bg-gray-800">
        {/* GitHub Icon (Inline SVG) */}
        <img loading="lazy" height="24" width="24" id="provider-logo" src="https://authjs.dev/img/providers/github.svg"></img>


        {/* Text */}
          <div className="px-4 ml-1">
          Login with GitHub
          </div>
      </button>
    </form>
  )
}

export function SignOut({session}:{session:HastiSession}) {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
        <div className="">

            <button>{session.user.name}</button>

        </div>
        
    </form>
  )
}