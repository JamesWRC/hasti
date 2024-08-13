
import { SignIn, SignOut } from "@/frontend/components/authComp"
import AdminNavigation from "@/frontend/components/user/AdminNavigation"
import { auth } from '@/frontend/app/auth';
import { UserType } from "@/backend/interfaces/user";
import { redirect } from 'next/navigation';


export default async function Example({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Show login form if no session
  if (!session || session.user.type !== UserType.ADMIN) {
    redirect('/404'); // Redirects to /404 if not an admin or valid session
  }

  return (
    // Make the nave and div side by side
    <div className="grid grid-cols-3 border-r border-gray-200 bg-white px-3 overflow-hidden">
      <div className="h-full overflow-hidden flex-shrink-0 flex items-center justify-center gap-x-4 col-span-2 border-r border-gray-200 bg-white pl-3">
        {children}
      </div>
      <nav className="flex flex-1 flex-col col-span-1 pl-2">
        <ul role="list" className="">
          <li className=''>
            <ul role="list" className="-mx-2 space-y-6 max-h-[50%] px-2 md:px-10 py-5">
              <AdminNavigation />
              <SignOut />
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}
