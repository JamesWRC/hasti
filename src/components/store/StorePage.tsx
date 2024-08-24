import {
  ArrowRightIcon

} from '@heroicons/react/24/outline'
import FeaturedGroup from '@/frontend/components/store/FeaturedGroup'
import { ProjectType } from '@/backend/interfaces/project'
import { Session } from 'next-auth'
import Search from '@/frontend/components/ui/search/Search';

export default function StorePage() {
  return (
    <div className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-[150%] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className='pb-8 text-left'>
            <Search />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Store</h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Explore popular Home Assistant Themes and Integrations
          </p>
        </div>
        <FeaturedGroup groupTitle={"Featured Themes"} type={ProjectType.THEME} limit={10} orderBy={'overallRating'} orderDirection={'desc'} />
        <FeaturedGroup groupTitle={"Featured Integrations"} type={ProjectType.INTEGRATION} limit={10} orderBy={'overallRating'} orderDirection={'desc'} />
        <FeaturedGroup groupTitle={"Featured Scripts"} type={ProjectType.SCRIPT} limit={10} orderBy={'overallRating'} orderDirection={'desc'} />
        <FeaturedGroup groupTitle={"Featured Sensor Projects"} type={ProjectType.SENSOR} limit={10} orderBy={'overallRating'} orderDirection={'desc'} />
        <FeaturedGroup groupTitle={"Featured DIY Projects"} type={ProjectType.DIY} limit={10} orderBy={'overallRating'} orderDirection={'desc'} />
      </div>

      {/* Call to action to contribute */}
      <div className="relative isolate overflow-hidden bg-dark m-12 rounded-2xl">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Want to get your cool smart home project featured?
              <br />
            </h2>
            <p className="mx-auto mt-10 max-w-2xl text-lg leading-8 text-gray-300">
              Sign up and start adding your project straight away! It&apos;s free, easy, and you&apos;ll be able to manage your projects and share it to the community in no time.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/user/projects"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started
              </a>
              <a href="/api/auth/signin" className="text-sm font-semibold leading-6 text-white">
                Sign up <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <svg
          viewBox="0 0 1024 1024"
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
        >
          <circle r={512} cx={512} cy={512} fill="url(#8d958450-c69f-4251-94bc-4e091a323369)" fillOpacity="0.7" />
          <defs>
            <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
              <stop stopColor="#0d98ba" />
              <stop offset={1} stopColor="#0d98ba" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
