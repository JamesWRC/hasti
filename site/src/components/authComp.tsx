import { signIn, signOut } from "@/app/auth"
export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      action={async () => {
        "use server"
        await signIn(provider)
      }}
    >
        <div>

            <button {...props}>Sign in with {provider}</button>

        </div>

    </form>
  )
}

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
        <div>

            <button>Sign in with</button>

        </div>
        
    </form>
  )
}