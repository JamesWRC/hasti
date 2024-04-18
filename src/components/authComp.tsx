import { signIn, signOut } from "@/frontend/app/auth"
import React from 'react';
import { MarkGithubIcon } from '@primer/octicons-react';
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@mantine/core";


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

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut({redirect: true, redirectTo: "/user/logout"})
      }}
    >
      <button
                      className={'bg-red-400 text-white group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full'}
                    >

                      <ArrowLeftOnRectangleIcon
                        className={'text-white group:hover:text-black h-6 w-6 shrink-0'}
                        aria-hidden="true"
                      />
                      Sign out

                      
                    </button>

      
        
    </form>
  )
}