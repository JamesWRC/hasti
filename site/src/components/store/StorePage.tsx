import {
ArrowRightIcon
    
  } from '@heroicons/react/24/outline'
import FeaturedGroup from '@/frontend/components/store/FeaturedGroup'
import { ProjectType } from '@/backend/interfaces/project'
import { Session } from 'next-auth'

export default function StorePage() {
    return (
      <div className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-[150%] px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Store</h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Explore popular Home Assistant Themes and Integrations
            </p>
          </div>
          <FeaturedGroup groupTitle={"Featured Themes"} type={ProjectType.THEME} limit={10}/>
          <FeaturedGroup groupTitle={"Featured Integrations"} type={ProjectType.INTEGRATION} limit={2}/>
        </div>
      </div>
    )
  }
  