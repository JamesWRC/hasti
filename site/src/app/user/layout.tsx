
  import { SignOut } from "@/frontend/components/authComp"
  import UserNavigation from "@/frontend/components/user/Navigation"
 

  export default function Example({
    children,
  }: {
    children: React.ReactNode
  }) {

  
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
                <UserNavigation/>
                <SignOut />
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
        </nav>
      </div>
    )
  }
  