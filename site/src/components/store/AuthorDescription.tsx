

export default function AuthorDescription({ name, link, imageUrl }: { name: string, link: string, imageUrl: string }) {
    return (

        <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
            <a className="-ml-4 flex items-center gap-x-4" href={link}>
                <svg viewBox="0 0 2 2" className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50">
                    <circle cx={1} cy={1} r={1} />
                </svg>
                <div className="flex gap-x-2.5">
                    <img src={imageUrl} alt="" className="h-6 w-6 flex-none rounded-full bg-white/10" />
                    <div className="hover:underline underline-offset-4 line-clamp-1">{name}</div>
                </div>
            </a>
        </div>
    )
}