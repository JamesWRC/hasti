import { Skeleton } from "@mantine/core";
import AuthorDescription from "./AuthorDescription";
import { getProjectLink } from "@/interfaces/project"
import type { Project, ProjectType } from  '@/backend/interfaces/project';
import { DynamicSkeletonText, DynamicSkeletonTitle } from "@/components/ui/skeleton/index";

import { createAvatar } from '@dicebear/core';
import Svg from "react-inlinesvg";

import { botttsNeutral, funEmoji, shapes, bottts  } from '@dicebear/collection';
import ColorBackground from "@/components/project/ColorBackground";
import type { UserProject } from "@/backend/interfaces/project/request";

const loaded = false

function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }
  
function rngAvatarBackground(projectID: string) {

    const seededRand = require('random-seed').create(projectID)

    const random = Math.floor(seededRand.random() * 3) + 1;

    const randRotate = seededRand.intBetween(0, 360)
    const randTranslateX = seededRand.intBetween(0, 30)
    const randTranslateY = seededRand.intBetween(0, 30)
    if( random === 1) {

    return createAvatar(botttsNeutral, {
        size: 50,
        seed: projectID,
        rotate: randRotate,
        translateX: randTranslateX,
        translateY: randTranslateY
        }).toDataUriSync()
    } else if (random === 2) {
        return createAvatar(funEmoji, {
            size: 50,
            seed: projectID,
            rotate: randRotate,
            translateX: randTranslateX,
            translateY: randTranslateY

            }).toDataUriSync()
    } else {
        return createAvatar(shapes, {
            size: 50,
            seed: projectID,
            rotate: randRotate,
            translateX: randTranslateX,
            translateY: randTranslateY

            }).toDataUriSync()
    }
}

export default function ProjectCard({userProject, style, loaded}: {userProject: UserProject, style: string, loaded: boolean}) {

    
    let className = "col-span-1 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 mb-4 min-w-[10.5rem] sm:max-h-none"
    
    if(style === 'featured') {
        className = classNames(className, "max-h-[15rem] h-full")
    }else{
        className = classNames(className, "max-h-[32rem]")
    }
  return (
    <article
        key={userProject.project.id}
        // className="col-span-1 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 mb-4 max-h-[32rem] min-w-[10.5rem] sm:max-h-none"
        className={className}
    
    >
        {/* <Svg src={createAvatar(identicon, {
                                    size: 16,
                                    seed: selectRepo.id,
                                    }).toDataUriSync()} /> */}
        {/* <img src={project.imageUrl} alt="" className={classNames("absolute inset-0 -z-10 h-full w-full object-cover", !loaded ? "blur-3xl" : "" )} /> */}
        <img src={userProject.project.backgroundImage && userProject.project.backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL  + '/' + userProject.project.backgroundImage : rngAvatarBackground(userProject.project.id)} alt="" className={classNames("absolute inset-0 -z-10 h-full w-full object-cover", !loaded || !userProject.project.backgroundImage ? `blur-[100px]` : "" )} />

        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40 " />
        <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/0 cursor-pointer" onClick={() => location.href = getProjectLink(userProject.project) ?? ''}/>
        <div className='-mx-4 sm:-mx-2'>
          
            <AuthorDescription name={userProject.user.username} imageUrl={`https://avatars.githubusercontent.com/u/${userProject.user.githubID}?v=4`} link={`https://github.com/${userProject.user.username}`} loaded={loaded}/>
            <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                <a href={getProjectLink(userProject.project)}>
                    {/* <span className="absolute inset-0" /> */}
                    <span className={"inset-0"} />
                    {loaded ? userProject.project.title : <DynamicSkeletonTitle/>}
                </a>
            </h3>
            <a className="mt-2 text-base text-gray-300 line-clamp-5 -mb-4" href={getProjectLink(userProject.project)}>{loaded ? userProject.project.description : <DynamicSkeletonText/>}</a>

        </div>
    </article>
  )
}