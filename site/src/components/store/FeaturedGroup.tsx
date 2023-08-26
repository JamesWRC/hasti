'use strict'
'use client'
import {
    ArrowRightIcon

} from '@heroicons/react/24/outline'


import AuthorDescription from '@/components/store/AuthorDescription';
import { getProjectLink } from '@/interfaces/Project';


export default function FeaturedGroup({
    groupTitle,
    groupPosts,
}: {
    groupTitle: string,
    groupPosts: any[],

}) {




    return (
        <div className="bg-white">
            <div className="mx-auto max-w-[150%] -px-0 md:px-6 lg:px-8 py-4 rounded-xl">
                <div className="grid grid-cols-[1fr,auto] items-center gap-4">
                    <div className="flex min-w-0 px-6">
                        <h2 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-900">
                            <a href="#Themes">{groupTitle}</a>
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
                    <div className="col-span-2 row-start-2 min-w-0 -mx-6 md:-mx-0">
                        <div className="md:-mx-4 ">
                            <div className="overflow-x-scroll scrollbar ">
                                {/* <div className="mx-auto mt-4 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5"> */}
                                <div className="mt-4 pl-3 min-w-[250%] grid grid-cols-10 gap-[11.35rem] sm:gap-[12rem] md:gap-[12rem] lg:gap-[12rem] xl:gap-12">
                                    {groupPosts.map((post) => (

                                        <article
                                        key={post.id}
                                            className="col-span-1 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 mb-4 max-h-[32rem] min-w-[10.5rem] sm:max-h-none"
                                        
                                        >
                                            <img src={post.imageUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
                                            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40 " />
                                            <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/0 cursor-pointer" onClick={() => location.href = getProjectLink(post) ?? ''}/>
                                            <div className='-mx-4 sm:-mx-2'>
                                              
                                                <AuthorDescription name={post.author.name} imageUrl={post.author.imageUrl} link={post.author.link} loaded={true}/>
                                                <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                                                    <a href={getProjectLink(post)}>
                                                        {/* <span className="absolute inset-0" /> */}
                                                        <span className="inset-0" />
                                                        {post.title}
                                                    </a>
                                                </h3>
                                                <a className="mt-2 text-base text-gray-300 line-clamp-5 -mb-4" href={getProjectLink(post)}>{post.shortDesc}</a>

                                            </div>
                                        </article>

                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
