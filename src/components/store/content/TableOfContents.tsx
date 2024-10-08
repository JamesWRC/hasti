import SidePaneContent from '@/frontend/components/store/content/SidePanelContent'

const people = [
    { title: 'Developer', description: 'INSERT DEVELOPER NAME HERE'},
    // More people...
  ]
  
  export default function TableOfContents() {
    return (
      <div className="bg-gray-900 rounded-3xl">
        <div className="mx-auto max-w-7xl">
          <div className="bg-gray-900 py-10 rounded-3xl">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold leading-6 text-white">Users</h1>
                  <p className="mt-2 text-sm text-gray-300">
                    A list of all the users in your account including their name, title, email and role.
                  </p>
                  {/* <SidePaneContent/> */}
                </div>
                {/* <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                  <button
                    type="button"
                    className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Add user
                  </button>
                </div> */}
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-700">

                      <tbody className="divide-y divide-gray-800">
                        {people.map((person) => (
                          <tr key={person.title}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">{person.title}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{person.description}</td>
                            
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  