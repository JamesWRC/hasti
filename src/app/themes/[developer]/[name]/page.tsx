'use client'
import { useState, useEffect } from 'react';
import { Box, Button, Group, Portal, rem, Switch, Title, Tooltip } from '@mantine/core';

import { Prose } from '@/frontend/components/markdoc/Prose';

import Details from '@/frontend/components/store/content/Details';
import { useDebouncedState, useHeadroom } from '@mantine/hooks';

import UGCDocument from '@/frontend/components/store/content/UGCDocument';
import TableOfContents from '@/frontend/components/store/content/TableOfContents';

import '@/frontend/app/prism.css'
import ColorBackground from '@/frontend/components/project/ColorBackground';
// import prism from "prismjs";

// import 'prismjs/components/prism-json'; // need this
import { ProjectAllInfo, getAllHaInstallTypes } from '@/backend/interfaces/project';
import { useSession } from 'next-auth/react';
import isValidProjectName from '@/frontend/helpers/user';
import { GetContentResponse, GetProjectsQueryParams } from '@/backend/interfaces/project/request';
import useProjects from '@/frontend/components/project';
import { LoadProjects } from '@/frontend/interfaces/project';
import { DynamicSkeletonImage, DynamicSkeletonText, DynamicSkeletonTitle } from '@/frontend/components/ui/skeleton';
import { IconArrowRight, IconCheck, IconSettings, IconX } from '@tabler/icons-react';
import { base64ToString } from '@/frontend/helpers/project';
// import projectCSS
import '@/frontend/app/page.module.css';
import axios from 'axios';

export default function Page({ params }: { params: { developer:string, name: string } }) {
  const { data: session, status } = useSession()

  const [scrollPosition, setScrollPosition] = useState(0);
  const pinned = useHeadroom({ fixedAt: 10 });
  // const [projectContent, setProjectContent] = useState<GetProjectContentResponse | undefined>();
  const [loadedProject, setLoadedProject] = useState<LoadProjects>()

  // Used to handle the switch for the published state. Project owner Only
  const [projectPublished, setProjectPublished] = useState(false);
  const [projectPublishedDebounce, setProjectPublishedDebounce] = useDebouncedState(false, 1000);
  const [content, setContent] = useState<GetContentResponse>({ success: false, content: '',  sha: ''});
  const [projectStats, setProjectStats] = useState([
    { name: 'Type', value: 'Theme', change: '', changeType: 'positive' },
    { name: 'Compatibility', value: '', change: '', changeType: 'positive' },
    { name: 'Stars', value: '3.2', change: '', changeType: 'positive' },
    { name: 'Activity', value: '$30,156.00', change: '', changeType: 'negative' },
  ]);

  const fetchProjects: GetProjectsQueryParams = {

    limit: 1,
    projectTitle: params.name,
    username: params.developer,
    allContent: true
  }

  const { projects, reqStatus } = useProjects(fetchProjects);

  useEffect(() => {

    setLoadedProject({ projects, reqStatus, setSearchProps: () => {} });

    // Set project stats
    let newStats = [];

    if (projects && projects.length > 0) {
      const project = projects[0] as ProjectAllInfo;
      if(project){

        const worksWithOS:boolean = project.worksWithOS;
        const worksWithContainer:boolean = project.worksWithContainer;
        const worksWithCore:boolean = project.worksWithCore;
        const worksWithSupervised:boolean = project.worksWithSupervised;

        let worksWithCount:number = 0
        let worksWith:string[] = []

        if(worksWithOS) {
          worksWithCount++
          worksWith.push('OS')
        }
        if(worksWithContainer) {
          worksWithCount++
          worksWith.push('Container')
        }
        if(worksWithCore) {
          worksWithCount++
          worksWith.push('Core')
        }
        if(worksWithSupervised) {
          worksWithCount++
          worksWith.push('Supervised')
        }
        // If all are selected, set to ANY
        if(worksWithCount === getAllHaInstallTypes().length - 1){
          worksWithCount = 1
          worksWith = ['All']
        }

        let worksWithStr = worksWith.join(', ')

        newStats.push({ name: 'Type', value: project.projectType, change: '', changeType: 'positive' })

        if(worksWithCount === 1){
          newStats.push({ name: 'Compatibility', value: worksWithStr, change: '', changeType: 'positive' })
        }else{
          newStats.push({ name: 'Compatibility', value: '', change: worksWithStr, changeType: 'positive' })
        }
        
        newStats.push({ name: 'Stars', value: project.repo.gitHubStars.toString(), change: '', changeType: 'positive' })
        newStats.push({ name: 'Activity', value: project.repo.gitHubStars.toString(), change: '', changeType: 'positive' })


        setProjectStats(newStats)


        axios({
          url: `${process.env.API_URL}/api/v1/projects/${project.id}/content/${project.contentSHA}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000,
          timeoutErrorMessage: 'Request timed out. Please try again.',
        }).then((response) => {
          const data = base64ToString(response.data.content)
          if(data){ 
            setContent({success: true, content: data, sha: project.contentSHA})
          }else{
            setContent({success: false, content: 'Error getting content', sha: project.contentSHA})
          }
        }).catch((error) => {
          const data = base64ToString(error.data.content)
          if(data){ 
            setContent({success: false, content: data, sha: project.contentSHA})
          }else{
            setContent({success: false, content: 'Error getting content', sha: project.contentSHA})
          }
          console.error('Error fetching project content', error)
        })
      }
      
    }

  }, [reqStatus])

  useEffect(() => {

    setProjectPublishedDebounce(projectPublished)

  }, [projectPublished])

  useEffect(() => {

    console.log('Project Published', projectPublishedDebounce)

  }, [projectPublishedDebounce])

  function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  function renderDetails(projectInfo: LoadProjects | undefined) {
    const projectData: ProjectAllInfo | null = projectInfo && projectInfo.projects ? projectInfo.projects[0] as ProjectAllInfo : null
    const projectUser = projectData?.user || null;

    let isUserOwner = false;

    if (projectUser && session?.user) {
      isUserOwner = session?.user?.id === projectUser.id;
    }

    return (
      <aside className="transition-all duration-700 sticky top-8 xl:w-96 shrink-0">
        <Details project={loadedProject} />
      </aside>

    )
  }

  function RenderDynamicPlaceholderContent() {
    const shouldShowTopImage = Math.floor(Math.random() * (1000 - 1 + 1)) + 1 > 700 ? true : false;
    const shouldShowTopImage2 = Math.floor(Math.random() * (1000 - 1 + 1)) + 1 > 700 ? true : false;
    const shouldShowTopImage3 = Math.floor(Math.random() * (1000 - 1 + 1)) + 1 > 700 ? true : false;

    return (
      <>
        <div className={classNames("flex flex-col", Math.floor(Math.random() * 10) + 1 > 7 ? " items-center justify-center" : "")}>
          {DynamicSkeletonTitle({ max: 10, min: 4 })}
          {shouldShowTopImage ? <div className={`mx-auto py-10 max-w-fit`}>{DynamicSkeletonImage({ height: 300, width: window.innerHeight })} </div> : null}

        </div>
        <div className="pt-3 pb-10 text-left">
          {DynamicSkeletonText({ max: 500, min: 40 })}
        </div>
        <div className={classNames("flex flex-col", Math.floor(Math.random() * 10) + 1 > 7 ? " items-center justify-center" : "")}>
          {DynamicSkeletonTitle({ max: 10, min: 4 })}
        </div>
        <div className="pt-3 pb-10 text-left">
          {DynamicSkeletonText({ max: 500, min: 40 })}
          {shouldShowTopImage2 ? <div className={`mx-auto py-10 max-w-fit`}>{DynamicSkeletonImage({ height: 400, width: window.innerHeight / 2 })} </div> : null}

        </div>
        <div className={classNames("flex flex-col", Math.floor(Math.random() * 10) + 1 > 7 ? " items-center justify-center" : "")}>
          {DynamicSkeletonTitle({ max: 10, min: 4 })}
        </div>
        <div className="pt-3 pb-10 text-left">
          {DynamicSkeletonText({ max: 500, min: 40 })}
        </div>
        <div className={classNames("flex flex-col", Math.floor(Math.random() * 10) + 1 > 7 ? " items-center justify-center" : "")}>
          {DynamicSkeletonTitle({ max: 10, min: 4 })}
        </div>
        <div className="pt-3 pb-10 text-left">
          {DynamicSkeletonText({ max: 500, min: 40 })}
          {shouldShowTopImage3 ? <div className={`mx-auto py-10 max-w-fit`}>{DynamicSkeletonImage({ height: 400, width: window.innerHeight / 2 })} </div> : null}

        </div>
        <div className={classNames("flex flex-col", Math.floor(Math.random() * 10) + 1 > 7 ? " items-center justify-center" : "")}>
          {DynamicSkeletonTitle({ max: 10, min: 4 })}
        </div>
        <div className="pt-3 pb-10 text-left">
          {DynamicSkeletonText({ max: 500, min: 40 })}
        </div>
      </>

    )
  }

  return (
    // Using tailwindcss design a page that showcases a a developers application
    // This page will be used to display the application and its features


    <>


      {/* // Banner if user doesnt upload a background image */}
      <div className="relative bg-white -mt-3 max-h-full">
        {/* <canvas id="myCanvas" className="absolute top-0 left-0 w-full h-28 lg:h-96 z-0 rounded-xl"></canvas> */}
        {/* <canvas id="myCanvas" className="absolute top-0 left-0 w-full h-28 z-0 rounded-xl"></canvas> */}
        <ColorBackground projectID={"b"} />
        <div className="relative z-10 rounded-b-2xl">
          <div className="sm:py-24 sm:px-6 lg:px-8 bg-opacity-30 backdrop-filter backdrop-blur-2xl h-40 w-full">
            {/* <div className=""> */}

          </div>
        </div>
      </div>
      {/* // End Banner */}

      {/* // Start of the main content */}
      {/* <div className='xl:px-24 2xl:px-40 3xl:px-72'> */}

      <div className='transition-all duration-700 mx-auto xl:max-w-5xl 2xl:max-w-6xl 4xl:max-w-8xl xl:-mt-24'>

        {/* // Header of stats */}
        <div className="relative bg-white -mt-3 h-8 z-10 rounded-2xl">
          <div className='bg-white rounded-2xl px-4 pt-6 md:px-28 md:pt-3 lg:px-40 lg:pt-4 mx-auto my-8'>
            <div className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl'>

              {/* // Package banner stats */}
              <dl className="mx-auto grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4 mt-4">
                {projectStats.map((stat) => (
                  <div
                    key={stat.name}
                    className="flex flex-wrap items-baseline gap-x-1 bg-white px-4 sm:px-6 xl:px-8 text-center justify-center"
                  >
                    <dt className="text-sm font-medium leading-6 text-gray-500 text-center  w-64">{stat.name}</dt>
                    <dd
                      className={classNames(
                        stat.changeType === 'negative' ? 'text-rose-600' : 'text-gray-700',
                        'text-xs font-medium  w-64'
                      )}
                    >
                      {stat.change}
                    </dd>
                    {reqStatus === 'success' && projects && projects[0]? 
                    <dd className="w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900 text-center">
                       {stat.value}
                    </dd> : <DynamicSkeletonText max={1} min={1}/> }
                  </div>
                ))}
              </dl>


            </div>
          </div>
        </div>

        {/* // Square image of package header */}
        {/* <div className='bg-white h-16 w-16 md:h-24 md:w-24 ml-7 2xl:ml-28 -mt-16 md:-mt-20 z-20 relative rounded-2xl transition-all duration-700 '> */}
        <div className='bg-white h-16 w-16 md:h-24 md:w-24 ml-7 md:ml-14 2xl:ml-20 -mt-10 md:-mt-20 z-20 relative rounded-2xl transition-all duration-700'>
          <img src="https://www.freepnglogos.com/uploads/512x512-logo/512x512-transparent-instagram-logo-icon-5.png" alt="Theme Icon" className="h-16 w-16 md:h-24 md:w-24 p-1" />
        </div>


      </div>
      {/* // user generated content */}
      <div className="flex w-full max-w-full items-start gap-x-8 py-32 z-10 px-10 md:pl-10 md:pr-3">

        <main className="flex-1">

          <Prose>
            {reqStatus === 'success' && loadedProject && loadedProject.projects && content.success? <UGCDocument source={content.content}></UGCDocument> :
              <RenderDynamicPlaceholderContent />
            }
          </Prose>
          {/* <div className='block xl:hidden'>
              {renderDetails()}
            </div> */}
        </main>
        <div className='hidden xl:block sticky top-0 pt-5'>
          <div className=''>
            {renderDetails(loadedProject)}
          </div>
        </div>

      </div>
      {/* // End of the main content */}


    </>

  )


  // return (
  //   <button
  //     type="button"
  //     className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
  //   >
  //     <svg
  //       className="mx-auto h-12 w-12 text-gray-400"
  //       stroke="currentColor"
  //       fill="none"
  //       viewBox="0 0 48 48"
  //       aria-hidden="true"
  //     >
  //       <path
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //         strokeWidth={2}
  //         d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
  //       />
  //     </svg>

  //     <span className="mt-2 block text-sm font-semibold text-gray-900">Create a new database for {params.name}</span>
  //   </button>
  // )
}
