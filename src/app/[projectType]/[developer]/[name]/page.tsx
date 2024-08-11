'use client'
import { useState, useEffect, useRef } from 'react';

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
import { base64ToString, getProjectActivity, getProjectStars, getProjectWorksWithList } from '@/frontend/helpers/project';
import { RepoAnalytics } from '@/backend/interfaces/repoAnalytics';
import { Skeleton } from "@mantine/core";


// import projectCSS
import '@/frontend/app/page.module.css';
import axios from 'axios';
import React from 'react';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import $ from 'jquery';

export default function Page({ params }: { params: { developer: string, name: string } }) {
  const { data: session, status } = useSession()

  const [scrollPosition, setScrollPosition] = useState(0);
  const pinned = useHeadroom({ fixedAt: 10 });
  // const [projectContent, setProjectContent] = useState<GetProjectContentResponse | undefined>();
  const [loadedProject, setLoadedProject] = useState<LoadProjects>()

  // Used to handle the switch for the published state. Project owner Only
  const [projectPublished, setProjectPublished] = useState(false);
  const [projectPublishedDebounce, setProjectPublishedDebounce] = useDebouncedState(false, 1000);
  const [content, setContent] = useState<GetContentResponse>({ success: false, content: '', sha: '' });
  const [projectStats, setProjectStats] = useState([
    { name: 'Type', value: 'Theme', change: '', changeType: 'positive' },
    { name: 'Compatibility', value: '', change: '', changeType: 'positive' },
    { name: 'Stars', value: 0, change: '', changeType: 'positive' },
    { name: 'Status', value: '', change: '', changeType: 'negative' },
  ]);

  const fetchProjects: GetProjectsQueryParams = {
    limit: 1,
    projectTitle: params.name,
    username: params.developer,
    allContent: true
  }

  const { projects, reqStatus } = useProjects(fetchProjects);
  const [projectContentRendered, setProjectContentRendered] = useState(false);

  // Handle anchor snapping on page load
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const hash = url.split('#')[1];
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);

          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
          }
        }, 1500);
      }
    };

    console.log('projectContentRendered', projectContentRendered)
    // If the page is loaded with a hash directly
    if (window.location.hash && projectContentRendered) {
      handleRouteChange(window.location.href);
    }

  }, [projectContentRendered]);


  useEffect(() => {

    setLoadedProject({ projects, reqStatus, setSearchProps: () => { } });

    // Set project stats
    let newStats = [];

    if (projects && projects.length > 0) {
      const project = projects[0] as ProjectAllInfo;
      const repoAnalytics: RepoAnalytics | null = project?.repo?.repoAnalytics?.at(0) || null;
      if (project) {

        const worksWithList = getProjectWorksWithList(project)
        const worksWithStr = worksWithList.join(', ')

        newStats.push({ name: 'Type', value: project.projectType, change: '', changeType: 'positive' })

        if (worksWithList.length === 1) {
          newStats.push({ name: 'Compatibility', value: worksWithStr, change: '', changeType: 'positive' })
        } else {
          newStats.push({ name: 'Compatibility', value: '', change: worksWithStr, changeType: 'positive' })
        }


        const statuses: string[] = ['New', 'Active', 'Inactive', 'Beta', 'Deprecated', 'Archived',]
        // Determine if the project is active or not based on the last commit date
        // If project created within the last 6 months, set to NEW
        // If the last commit date is within the last 1 year, set to ACTIVE
        // If the last commit date is over 1 year, set to INACTIVE
        // If repo is archived, set to ARCHIVED
        // TODO: Add beta and deprecated
        let projStatus = getProjectActivity(repoAnalytics, project)
        let projStars = getProjectStars(repoAnalytics)

        newStats.push({ name: 'Stars', value: projStars, change: '', changeType: 'positive' })

        newStats.push({ name: 'Status', value: projStatus, change: '', changeType: 'positive' })


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
          if (data) {
            setContent({ success: true, content: data, sha: project.contentSHA })
          } else {
            setContent({ success: false, content: 'Error getting content', sha: project.contentSHA })
          }
        }).catch((error) => {
          const data = base64ToString(error.data.content)
          if (data) {
            setContent({ success: false, content: data, sha: project.contentSHA })
          } else {
            setContent({ success: false, content: 'Error getting content', sha: project.contentSHA })
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


  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }


  function RenderDetails({ loadProjects }: { loadProjects: LoadProjects | undefined }) {
    // const repoAnalytics: RepoAnalytics | null = projectInfo?.repo?.repoAnalytics?.at(0) || null;

    const projectData: ProjectAllInfo | null = loadProjects ? loadProjects.projects?.at(0) as ProjectAllInfo : null
    const projectUser = projectData?.user || null;

    let isUserOwner = false;

    if (projectUser && session?.user) {
      isUserOwner = session?.user?.id === projectUser.id;
    }


    const OverallRatingBar = styled(LinearProgress)(({ theme }) => ({
      height: 10,
      borderRadius: 5,
      [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: "#42485c"
      },
      [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        background: 'linear-gradient(to right, #FF5F6D , #FFC371)', // Change this line
      },
    }));

    const PopularityBar = styled(LinearProgress)(({ theme }) => ({
      height: 7.5,
      borderRadius: 5,
      [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: "#2c3242"
      },
      [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        background: 'linear-gradient(90deg,  #009efd 0%, #2af598 100%)', // Change this line
      },
    }));

    const ActivityBar = styled(LinearProgress)(({ theme }) => ({
      height: 7.5,
      borderRadius: 5,
      [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: "#2c3242"
      },
      [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        background: 'linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #fa709a 66%, #fa709a 100%)', // Change this line
      },
    }));

    let popularityRating = 0
    let activityRating = 0
    let overallRating = 0
    if (projectData) {
      overallRating = projectData.overallRating
      popularityRating = projectData.popularityRating
      activityRating = projectData.activityRating

    }
    // overallRating = 100
    // activityRating = 80
    // popularityRating = 100
    return (
      <aside className="transition-all duration-700 xl:w-72">
        <div className="bg-gray-900 rounded-3xl mb-4 top-0 z-10 ">
          <div className="mx-auto max-w-7xl">
            <div className="bg-gray-900 py-10 rounded-3xl min-w-full">
              <div className="px-2">
                <Stack spacing={1} sx={{ flexGrow: 1 }} className='px-4'>
                  <div className="flex justify-between">
                    <div className='text-white font-bold'>Rating</div>
                    {
                      projectContentRendered ?
                        <div className='text-white font-bold flex'>{overallRating}<div className='text-white font-thin pl-1'>/100</div></div>
                        :
                        <Skeleton height={10} mt={6} radius="xl" width={30} className="mr-1.5 opacity-75" />
                    }
                  </div>
                  <OverallRatingBar variant="determinate" value={overallRating} />
                </Stack>

                <Stack spacing={1} sx={{ flexGrow: 1 }} className='pt-6 px-8'>
                  <div className="flex justify-between">
                    <div className='text-white font'>Activity</div>
                    {
                      projectContentRendered ?
                        <div className='text-white font'>{activityRating}</div>
                        :
                        <Skeleton height={10} mt={6} radius="xl" width={20} className="mr-1.5 opacity-75" />
                    }
                  </div>

                  <ActivityBar variant="determinate" value={activityRating} />
                </Stack>

                <Stack spacing={1} sx={{ flexGrow: 1 }} className='pt-2 px-8'>
                  <div className="flex justify-between">
                    <div className='text-white'>Popularity</div>
                    {
                      projectContentRendered ?
                        <div className='text-white font'>{popularityRating}</div>
                        :
                        <Skeleton height={10} mt={6} radius="xl" width={20} className="mr-1.5 opacity-75" />
                    }
                  </div>
                  <PopularityBar variant="determinate" value={popularityRating} />
                </Stack>
              </div>

            </div>

          </div>
        </div>
        <div className="bg-gray-900 rounded-3xl mb-4 sticky z-20">
          <Details loadedProject={loadedProject} reqStatus={reqStatus} />
        </div>
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
          {DynamicSkeletonTitle({ max: 10, min: 4, maxWidth: 40})}
          {shouldShowTopImage ? <div className={`mx-auto py-10 max-w-fit`}>{DynamicSkeletonImage({ height: 300, width: typeof window !== 'undefined' ? window.innerHeight : 0 })} </div> : null}

        </div>
        <div className="pt-3 pb-10 text-left">
          {DynamicSkeletonText({ max: 500, min: 40, maxWidth: 80 })}
        </div>
        <div className={classNames("flex flex-col", Math.floor(Math.random() * 10) + 1 > 7 ? " items-center justify-center" : "")}>
          {DynamicSkeletonTitle({ max: 10, min: 4 })}
        </div>
        <div className="pt-3 pb-10 text-left">
          {DynamicSkeletonText({ max: 500, min: 40, maxWidth: 80 })}
          {shouldShowTopImage2 ? <div className={`mx-auto py-10 max-w-fit`}>{DynamicSkeletonImage({ height: 400, width: typeof window !== 'undefined' ? window.innerHeight : 2 / 2 })} </div> : null}

        </div>
        <div className={classNames("flex flex-col", Math.floor(Math.random() * 10) + 1 > 7 ? " items-center justify-center" : "")}>
          {DynamicSkeletonTitle({ max: 10, min: 4, maxWidth: 80 })}
        </div>
        <div className="pt-3 pb-10 text-left">
          {DynamicSkeletonText({ max: 500, min: 40, maxWidth: 80 })}
        </div>
        <div className={classNames("flex flex-col", Math.floor(Math.random() * 10) + 1 > 7 ? " items-center justify-center" : "")}>
          {DynamicSkeletonTitle({ max: 10, min: 4 })}
        </div>
        <div className="pt-3 pb-10 text-left">
          {DynamicSkeletonText({ max: 500, min: 40, maxWidth: 80 })}
          {shouldShowTopImage3 ? <div className={`mx-auto py-10 max-w-fit`}>{DynamicSkeletonImage({ height: 400, width: typeof window !== 'undefined' ? window.innerHeight : 2 / 2 })} </div> : null}

        </div>
        <div className={classNames("flex flex-col", Math.floor(Math.random() * 10) + 1 > 7 ? " items-center justify-center" : "")}>
          {DynamicSkeletonTitle({ max: 10, min: 4 })}
        </div>
        <div className="pt-3 pb-10 text-left">
          {DynamicSkeletonText({ max: 500, min: 40, maxWidth: 80 })}
        </div>
      </>

    )
  }


  return (
    // Using tailwindcss design a page that showcases a a developers application
    // This page will be used to display the application and its features


    <div >


      {/* // Banner if user doesnt upload a background image */}
      <div className="relative bg-white -mt-3 max-h-full">
        {/* <canvas id="myCanvas" className="absolute top-0 left-0 w-full h-28 lg:h-96 z-0 rounded-xl"></canvas> */}
        {/* <canvas id="myCanvas" className="absolute top-0 left-0 w-full h-28 z-0 rounded-xl"></canvas> */}
        {reqStatus === 'success' && projects && projects.length > 0 && projects[0] && projects[0].backgroundImage ? <div>
          <img src={`${process.env.USER_CONTENT_URL}/${projects[0].backgroundImage}`} className="w-full h-72 sm:h-[25rem] md:h-[20rem] 5xl:h-[35rem] object-cover rounded-t-2xl" />
        </div> : <><ColorBackground projectID={`${params.name}/${params.name} D`} />
          <div className="relative z-10 rounded-b-2xl bg-red">
            <div className="sm:py-24 sm:px-6 lg:px-8 bg-opacity-30 backdrop-filter backdrop-blur-2xl h-40 w-full">
              {/* <div className=""> */}

            </div>
          </div></>}
      </div>
      {/* // End Banner */}

      {/* // Start of the main content */}
      {/* <div className='xl:px-24 2xl:px-40 3xl:px-72'> */}

      <div className='transition-all duration-700 mx-auto max-w-5xl 2xl:max-w-6xl 4xl:max-w-8xl -mt-24 z-50'>

        {/* // Header of stats */}
        <div className="relative bg-white -mt-3 h-8 z-10 rounded-2xl">
          <div className='bg-white rounded-2xl px-4 pt-6 md:px-10 md:pt-3 lg:px-40 lg:pt-4 mx-auto my-8'>

            <div className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl'>
              {/* <div className='bg-white h-16 w-16 rounded-2xl transition-all duration-700 -mt-20 sm:-mt-20 md:-mt-16 ml-8 md:-ml-12'> */}
              {reqStatus === 'success' && projects && projects.length > 0 && projects[0] && projects[0].iconImage ?
                <div className='bg-white h-16 w-16 lg:h-24 lg:w-24 rounded-2xl transition-all duration-700 -mt-20 md:-mt-[4.5rem] lg:-mt-16 ml-8 md:ml-6 lg:-ml-20'>

                  <img src={`${process.env.USER_CONTENT_URL}/${projects[0]?.iconImage}`} className="w-full h-40 h-96 object-cover rounded-t-2xl" />
                </div>
                : <div className='bg-transparent h-16 w-16 lg:h-24 lg:w-24 rounded-2xl transition-all duration-700 -mt-20 md:-mt-[4.5rem] lg:-mt-16 ml-8 md:ml-6 lg:-ml-20 mb-2' />}
              {/* // Package banner stats */}
              <dl className="mx-auto grid grid-cols-2 gap-px xs:grid-cols-4 lg:-mt-8">
                {projectStats.map((stat) => (
                  <div
                    key={stat.name}
                    className="flex flex-wrap items-baseline gap-x-1  px-4 sm:px-6 xl:px-8 text-center justify-center"
                  >
                    <dt className="text-sm font-medium leading-6 text-gray-500 text-center w-64">{stat.name}</dt>
                    <dd
                      className={classNames(
                        stat.changeType === 'negative' ? 'text-rose-600' : 'text-gray-700',
                        'text-xs font-medium  w-64'
                      )}
                    >
                      {stat.change}
                    </dd>

                    {reqStatus !== 'success' ? 
                    <DynamicSkeletonText max={1} min={1} maxWidth={40}/> 
                    :
                    (projects && projects[0] &&
                      <dd className="w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900 text-center">
                        {stat.value}
                      </dd>)
                    }
                  </div>
                ))}

              </dl>


            </div>
          </div>
        </div>



      </div>
      {/* // user generated content */}
      <div className="flex w-full max-w-full items-start gap-x-8 py-32 z-10 px-10 md:pl-10 md:pr-3">

        <main className="flex-1">

          <Prose>
            {
              reqStatus === 'success' && loadedProject && loadedProject.projects && content.success ?
                <UGCDocument source={content.content} setProjectContentRendered={setProjectContentRendered}></UGCDocument>
                :
                <RenderDynamicPlaceholderContent />
            }
          </Prose>
          <div className='block xl:hidden'>
            <RenderDetails loadProjects={loadedProject} />
          </div>
        </main>
        <div className='hidden xl:block top-8 sticky'>
          <RenderDetails loadProjects={loadedProject} />
        </div>

      </div>
      {/* // End of the main content */}


    </div>

  )
}
