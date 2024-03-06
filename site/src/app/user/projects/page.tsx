'use client'
import {
    FolderPlusIcon
} from '@heroicons/react/24/outline'
import FeaturedGroup from '@/components/store/FeaturedGroup'
import { groupPosts } from '@/interfaces/placeholders'
import { Session } from 'next-auth'
import PackageCard from '@/components/store/PackageCard'
import { Grid } from '@mantine/core';

export default function Page() {


    return (
        <div className="bg-white py-24 sm:py-28">
            <div className="mx-auto max-w-[150%] px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl py-4">Your Packages</h2>
                </div>
                <Grid>

                {groupPosts.map((project, index) => (
                    <>
                        {index === 0 ? createNewProject() : null}

                        <Grid.Col span={{ base: 12, md: 4, lg: 4 }} key={`t-${project.id}`}>

                            <PackageCard project={project} style={"featured"}/>
                        </Grid.Col>
                    </>

                    ))}

                {/* <FeaturedGroup groupTitle={"Your Themes"} groupPosts={groupPosts} />
                <FeaturedGroup groupTitle={"Your Integrations"} groupPosts={groupPosts} /> */}
                </Grid>
            </div>
        </div>

    )
}

export function createNewProject() {
    return (
        <div key={`create-new-project`} className="col-span-1 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 py-8 my-4 min-w-[10.5rem] sm:max-h-none max-h-[15rem]">
            <button
            type="button"
            className="relative block w-full h-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
            <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
            >
<            FolderPlusIcon/>
            </svg>
            <span className="mt-2 block text-sm font-semibold text-gray-900">Create new Project</span>
            </button>
        </div>
        
          
    )
}