import { Avatar } from "@mantine/core";
import { DynamicSkeletonText } from '@/frontend/components/ui/skeleton';


export default function AuthorDescription({ name, link, imageUrl, loaded }: { name: string|undefined, link: string, imageUrl: string, loaded:boolean }) {
    
    if(!loaded) {
        // Some random default github lookn image
        imageUrl = 'https://avatars.githubusercontent.com/u/10?v=4'
    }

    return (

        <div className="flex flex-wrap items-center gap-y-1 text-ellipsis overflow-hidden text-sm leading-6 text-gray-300">
            <a className="-ml-4 flex items-center gap-x-4" href={link} target={"_blank"}>
                <svg viewBox="0 0 2 2" className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50">
                    <circle cx={1} cy={1} r={1} />
                </svg>
                <div className="flex gap-x-2.5">
                    {/* <img src={imageUrl} alt="" className={loaded ? "h-6 w-6 flex-none rounded-full bg-white/10" : "hidden"}/> */}
                    <Avatar.Group spacing="md">
                        <Avatar src={imageUrl} radius="xl" size={"sm"} className={"flex-none rounded-full bg-white/10"}/>
                    </Avatar.Group>
                    <div className="hover:underline underline-offset-4 line-clamp-1">{loaded ? name : < DynamicSkeletonText min={1} max={3}  />}</div>
                </div>
            </a>
        </div>
    )
}