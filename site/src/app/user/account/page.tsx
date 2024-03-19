import { auth } from '@/app/auth'
import UpdateRepoAccess from '@/components/user/UpdateRepoAccess'
import { PaperClipIcon } from '@heroicons/react/20/solid'

export default async function Example() {
    const session = await auth()

  return (
    <div className='px-4 md:px-10 w-full'>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Applicant Information</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Personal details and settings.</p>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">GitHub ID</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{session?.user?.id}</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">GitHub Username</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{session?.user?.name}</dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900 pt-3">Repository Access</dt>
            <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
            <a href={`https://github.com/apps/hasti-bot/installations/new?state=${session?.user?.id}`}>

              <button className="flex items-center bg-dark text-white font-bold py-2 pl-3 -ml-1 rounded-2xl focus:outline-none focus:shadow-outline-gray hover:bg-gray-700 w-full"
              >
                <img loading="lazy" height="32" width="32" id="provider-logo" src="https://authjs.dev/img/providers/github.svg"/>
                    <div className="px-4 ml-1 py-2.5">Update Repository permissions</div>
                    </button>
                    </a>
            </dd>
          </div>
          <UpdateRepoAccess />

        </dl>
        
      </div>
    </div>
  )
}
