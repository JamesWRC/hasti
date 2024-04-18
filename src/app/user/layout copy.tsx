import {
    CalendarIcon,
    ChartPieIcon,
    DocumentDuplicateIcon,
    FolderIcon,
    HomeIcon,
    UsersIcon,
    ArrowLeftOnRectangleIcon
  } from '@heroicons/react/24/outline'
  import { SignOut } from "@/frontend/components/authComp"

  const navigation = [
    { name: 'Account', href: '#', icon: UsersIcon, current: true },
    { name: 'Projects', href: '#', icon: FolderIcon, count: '5', current: false },
    { name: 'Sign Out', href: '#', icon: ArrowLeftOnRectangleIcon, current: false },
    // { name: 'Projects', href: '#', icon: FolderIcon, count: '12', current: false },
    // { name: 'Calendar', href: '#', icon: CalendarIcon, count: '20+', current: false },
    // { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
    // { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
  ]
  const teams = [
    { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
    { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
    { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
    { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
    { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
    { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
    { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
    { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
    { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
    { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
    { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
    { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
  ]
  
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }
  

  // export function SignOut({session}:{session:HastiSession}) {
  //   return (
  //     <form
  //       action={async () => {
  //         "use server"
  //         await signOut()
  //       }}
  //     >
  //         <div className="">
  
  //             <button>{session.user.name}</button>
  
  //         </div>
          
  //     </form>
  //   )
  // }

  export default function Example({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
        // Make the nave and div side by side
      <div className="grid grid-cols-3 gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-3">
        <div className="flex-shrink-0 flex items-center justify-center gap-x-4 py-4 col-span-2 border-r border-gray-200 bg-white pl-3">
           {children}
        </div>
        <nav className="flex flex-1 flex-col col-span-1 pl-2">
          <ul role="list" className="">
            <li className=''>
              <ul role="list" className="-mx-2 space-y-6 max-h-[50%] px-2 md:px-10">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={classNames(
                        item.name === 'Sign Out' ? 'bg-red-400 text-white' :
                        item.current
                          ? 'bg-gray-50 text-indigo-600'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current ? 'text-indigo-600' : item.name === 'Sign Out' ? 'text-white group:hover:text-black' : 'text-gray-400 group-hover:text-indigo-600',
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                      {item.count ? (
                        <span
                          className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-1.5 py-0.5 text-center text-xs font-medium leading-5 text-gray-600 ring-1 ring-inset ring-gray-200"
                          aria-hidden="true"
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            {/* <li>
            <div className="text-xs font-semibold leading-6 text-gray-400">Your teams</div>
              <ul role="list" className="-mx-2 mt-2 space-y-1 overflow-y-scroll">
                {teams.map((team) => (
                  <li key={team.name}>
                    <a
                      href={team.href}
                      className={classNames(
                        team.current
                          ? 'bg-gray-50 text-indigo-600'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <span
                        className={classNames(
                          team.current
                            ? 'text-indigo-600 border-indigo-600'
                            : 'text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600',
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'
                        )}
                      >
                        {team.initial}
                      </span>
                      <span className="truncate">{team.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li> */}
          </ul>
          <SignOut />
        </nav>
      </div>
    )
  }
  