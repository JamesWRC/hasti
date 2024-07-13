'use strict'
'use client'
import {
    ArrowRightIcon

} from '@heroicons/react/24/outline'

import type { Project } from  '@/backend/interfaces/project';
import PackageCard from './ProjectCard';
import type { ProjectWithUser } from '@/backend/clients/prisma/client';
import useProjects from '@/frontend/components/project'
import { FeaturedGroup } from '@/frontend/interfaces/ui';


export default function FeaturedGroupSection({...props}: FeaturedGroup) {

    const {projects, reqStatus} = useProjects({...props});

    

    if (projects && reqStatus === 'success' && projects.length < 10 ) {
        return null
    }

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-[150%] -px-0 md:px-6 lg:px-8 py-4 rounded-xl">
                <div className="grid grid-cols-[1fr,auto] items-center gap-4">
                    <div className="flex min-w-0 px-6">
                        <h2 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-900">
                            <a href="#Themes">{props.groupTitle}</a>
                        </h2>
                    </div>
                    <div className="ml-6 flex items-center">
                        <div className="flex space-x-1 rounded-lg bg-slate-100 p-0.5" role="tablist" aria-orientation="horizontal">
                            <button className="flex items-center rounded-md py-[0.4375rem] pl-2 pr-2 text-sm font-semibold lg:pr-3" id="headlessui-tabs-tab-11" role="tab" type="button" aria-selected="false" tabIndex={-1} data-headlessui-state="" aria-controls="headlessui-tabs-panel-13" control-id="ControlID-13">
                                <span className="sr-only lg:not-sr-only lg:ml-2 text-slate-600">more</span>
                                <ArrowRightIcon className="ml-2 h-4 w-4 text-slate-600" aria-hidden="true" />

                            </button>
                        </div>
                    </div>
                    <div className="col-span-2 row-start-2 min-w-0">
                        <div className="md:-mx-4 ">
                            <div className="overflow-x-scroll scrollbar">
                                {/* <div className="mx-auto mt-4 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5"> */}
                                <div className="mt-4 pl-3 min-w-[250%] grid grid-cols-10 gap-[11.35rem] sm:gap-[12rem] md:gap-[12rem] lg:gap-[12rem] xl:gap-12">
                                    {projects && projects.length > 0 ? projects.map((project:ProjectWithUser, index:number) => (
                                        <div key={`featured-group-${index}`}>
                                            <PackageCard userProject={project} style={"featured"} loaded={reqStatus === "success"} />
                                        </div>)
                                    ): <div className=" mx-auto flex justify-center items-center h-96">
                                        No projects found :(
                                        </div>
                                        }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
