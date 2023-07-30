import {
    ArrowRightIcon

} from '@heroicons/react/24/outline'
export default function FeaturedGroup({
    groupTitle,
    groupPosts,
    product,
    isDisabled,
    selectedSession,
    sessionTimeSlot,
    selectedProduct,
  }: {
    groupTitle: string, 
    groupPosts: any[],

  }) {
    return (
        <div className="bg-white py-12 -mx-4">
            <div className="mx-auto max-w-[150%] -px-0 md:px-6 lg:px-8">
                <div className="grid grid-cols-[1fr,auto] items-center gap-4 mt-8">
                    <div className="flex min-w-0">
                        <h2 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
                            <a href="#Themes">{groupTitle}</a>
                        </h2>
                    </div>
                    <div className="ml-6 flex items-center">
                        <div className="flex space-x-1 rounded-lg bg-slate-100 p-0.5" role="tablist" aria-orientation="horizontal">
                            <button className="flex items-center rounded-md py-[0.4375rem] pl-2 pr-2 text-sm font-semibold lg:pr-3" id="headlessui-tabs-tab-11" role="tab" type="button" aria-selected="false" tabindex="-1" data-headlessui-state="" aria-controls="headlessui-tabs-panel-13" control-id="ControlID-13">
                                <span className="sr-only lg:not-sr-only lg:ml-2 text-slate-600">more</span>
                                <ArrowRightIcon className="ml-2 h-4 w-4 text-slate-600" aria-hidden="true" />

                            </button>
                        </div>
                    </div> 
                    <div className="col-span-2 row-start-2 min-w-0">
                    <div className="">
                    <div className="overflow-x-scroll scrollbar">
                    {/* <div className="mx-auto mt-4 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5"> */}
                    <div className="min-w-[250%] mt-4 grid grid-cols-12 col gap-4 sm:gap-8">
                            {groupPosts.map((post) => (
                                <article
                                    key={post.id}
                                    className="col-span-3 md:col-span-2 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 mb-4"
                                >
                                    <img src={post.imageUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                                    <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                                    <div className=''>
                                        <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
                                            <time dateTime={post.datetime} className="mr-8">
                                                {post.date}
                                            </time>
                                            <div className="-ml-4 flex items-center gap-x-4">
                                                <svg viewBox="0 0 2 2" className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50">
                                                    <circle cx={1} cy={1} r={1} />
                                                </svg>
                                                <div className="flex gap-x-2.5">
                                                    <img src={post.author.imageUrl} alt="" className="h-6 w-6 flex-none rounded-full bg-white/10" />
                                                    {post.author.name}
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                                            <a href={post.href}>
                                                <span className="absolute inset-0" />
                                                {post.title}
                                            </a>
                                        </h3>
                                        <p className="mt-4 text-base text-gray-300 line-clamp-5 -mb-4">{post.shortDesc}</p>
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
