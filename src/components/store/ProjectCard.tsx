'use client'
import { Button, Group, Skeleton, Title } from "@mantine/core";
import AuthorDescription from "./AuthorDescription";
import { getProjectLink } from "@/frontend/interfaces/project"
import type { Project, ProjectType } from '@/backend/interfaces/project';
import { DynamicSkeletonText, DynamicSkeletonTitle } from "@/frontend/components/ui/skeleton/index";

import { createAvatar } from '@dicebear/core';
import Svg from "react-inlinesvg";

import { botttsNeutral, funEmoji, shapes, bottts } from '@dicebear/collection';
import ColorBackground from "@/frontend/components/project/ColorBackground";
import type { ProjectWithUser } from '@/backend/clients/prisma/client'
import { IconSettings } from "@tabler/icons-react";
import { auth } from "@/frontend/app/auth";
import { useSession } from "next-auth/react";
import { useDisclosure } from "@mantine/hooks";
import SettingsButton from "@/frontend/components/project/SettingsButton";
import { usePathname } from "next/navigation";
import { getProjectIcon, rngAvatarBackground } from "@/frontend/components/ui/project";
import { SwatchIcon } from "@heroicons/react/24/outline";
const loaded = false

function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
}


export default function ProjectCard({ userProject, style, loaded }: { userProject: ProjectWithUser, style: string, loaded: boolean }) {

    const { data: session, status } = useSession()
    const pathname = usePathname()
    const isUserProjects = pathname === '/user/projects'
    let isUserOwner = false;
    if (userProject?.user && session?.user) {
        isUserOwner = session?.user?.id === userProject.user.id;
    }

    let canEdit: boolean = false;
    // if button should show
    if (userProject && isUserProjects) {
        // If user has permission to edit
        canEdit = isUserOwner || !userProject?.claimed
    }


    let className = "text-ellipsis overflow-hidden col-span-1 relative isolate flex flex-col justify-end rounded-2xl px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 mb-4 min-w-[10.5rem] sm:max-h-none"

    if (style === 'featured') {
        className = classNames(className, "max-h-[15rem] h-full")
    } else {
        className = classNames(className, "max-h-[32rem]")
    }
    return (
        <article
            key={userProject?.id}
            // className="col-span-1 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 mb-4 max-h-[32rem] min-w-[10.5rem] sm:max-h-none"
            className={className}

        >

            {userProject && canEdit && loaded ? <div className="absolute top-5 right-5 z-20">
                <SettingsButton projectID={userProject?.id} />
            </div> : null}
            <img src={userProject?.backgroundImage && userProject?.backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL + '/' + userProject?.backgroundImage : rngAvatarBackground(userProject?.id)} alt="" className={classNames("absolute inset-0 -z-10 h-full w-full object-cover", !loaded || !userProject?.backgroundImage ? `blur-[100px]` : "")} />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40 " />
            <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/0 cursor-pointer" onClick={() => location.href = getProjectLink(userProject) ?? ''} />
            <div className='-mx-4 sm:-mx-2'>

                <AuthorDescription name={userProject?.user.username} imageUrl={`https://avatars.githubusercontent.com/u/${userProject?.user.githubID}?v=4`} link={`/users/${userProject?.user.username}`} loaded={loaded} />
                <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                    <a href={getProjectLink(userProject)}>
                        {/* <span className="absolute inset-0" /> */}
                        <span className={"inset-0"} />
                        {loaded ? userProject?.title : <DynamicSkeletonTitle max={5} min={3} maxWidth={100} />}
                    </a>
                </h3>
                <a className="mt-2 text-base text-gray-300 line-clamp-5 -mb-4" href={getProjectLink(userProject)}>{loaded ? userProject?.description : <DynamicSkeletonText min={4} max={10} maxWidth={60}/>}</a>
                <div className="pt-6 -mb-4 flex justify-end">
                    {/* <span className="text-gray-300 text-sm mr-2">•</span> */}
                    {getProjectIcon(userProject, { className: "text-white w-6 h-6" })}
                    {loaded ? <span className="text-gray-300 text-sm ml-2 mt-0.5">{userProject?.projectType}</span> : <DynamicSkeletonText min={2} max={3} maxWidth={40}/>}
                    {/* <span className="text-gray-300 text-sm ml-2">•</span> */}
                </div>
            </div>
        </article>
    )
}