'use client'
import { useState, useEffect } from 'react';
import { Box, Portal, rem, Text } from '@mantine/core';

import { Prose } from '@/components/markdoc/Prose';

import Details from './details';
import { useHeadroom } from '@mantine/hooks';

import UGCDocument from '@/components/store/content/UGCDocument';
export default function Page({ params }: { params: { name: string } }) {

  const [scrollPosition, setScrollPosition] = useState(0);
  const pinned = useHeadroom({ fixedAt: 10 });
  const [pkgContent, setPkgContent] = useState({} as any);

  const stats = [
    { name: 'Revenue', value: '$405,091.00', change: '', changeType: 'positive' },
    { name: 'Overdue invoices', value: '$12,787.00', change: '', changeType: 'negative' },
    { name: 'Outstanding invoices', value: '$245,988.00', change: '', changeType: 'positive' },
    { name: 'Expenses', value: '$30,156.00', change: '', changeType: 'negative' },
  ]

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

  // Handle the canvas that renders random color hues 
  useEffect(() => {
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const randPkgName = params.name.replace(/[^a-z0-9]/gi, '');
    const moreColor = true

    // var rand = require('random-seed').create(randPkgName);
    var rand = require('random-seed').create(Math.random());
    const seed = rand.intBetween(0, 10);

    let x1, y1, x2, y2, x3, y3, rngCount = 100;
    do {
      x1 = Math.floor(rand.intBetween(0, canvas.width));
      y1 = Math.floor(rand.intBetween(1, canvas.height));

      x2 = Math.floor(rand.intBetween(2, canvas.width));
      y2 = Math.floor(rand.intBetween(3, canvas.height));

      x3 = Math.floor(rand.intBetween(1, canvas.width));
      y3 = Math.floor(rand.intBetween(1, canvas.height));

      rngCount--;
      console.log(rngCount)
    } while (Math.hypot(x2 - x1, y2 - y1) <= 100 || rngCount <= 0); // ensure the circles never touch

    const rotation = Math.random() * 1 * 0.025; // random rotation in radians

    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    // gradient.addColorStop(0, 'cyan');
    // gradient.addColorStop(1, 'red');

    ctx.save(); // save the current state
    ctx.rotate(rotation); // rotate the canvas


    const hue = Math.floor(Math.random() * 360);

    // Generate complementary hue
    const complementaryHue = (hue + 140) % 360;

    // Convert hues to CSS HSL strings
    const color1 = `hsl(${hue}, 100%, 50%)`;
    const color2 = `hsl(${complementaryHue}, 100%, 50%)`;

    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.beginPath();

    ctx.arc(x1, y1, 7.5, 0, 2 * Math.PI, false);
    ctx.arc(x2, y2, 7.5, 0, 2 * Math.PI, false);

    const distanceToEdge = Math.min(x1, y1, canvas.width - x1, canvas.height - y1);

    ctx.shadowBlur = (canvas.width / 2 - distanceToEdge) / 2;

    ctx.arc(x3, y3, rand.intBetween(10, 25), 0, 2 * Math.PI, false);

    ctx.arc(0, y1 - 50, 7.5, 0, 2 * Math.PI, false);
    ctx.arc(100, 100, 15, 20, 2 * Math.PI, false);

    ctx.fillStyle = gradient;
    if (moreColor) {
      const hue2 = Math.floor(Math.random() * 360);

      // Generate complementary hue
      const complementaryHue2 = (hue2 + 140) % 360;

      // Convert hues to CSS HSL strings
      const color21 = `hsl(${hue2}, 100%, 50%)`;
      const color22 = `hsl(${complementaryHue2}, 100%, 50%)`;
      const gradient2 = ctx.createLinearGradient(0, 0, 0, canvas.height);

      gradient2.addColorStop(0, color21);
      gradient2.addColorStop(1, color22);


      ctx.arc(canvas.width, canvas.height, rand.intBetween(10, 25), 0, 2 * Math.PI, false);
      ctx.fillStyle = gradient2;
    }


    ctx.fill();
  }, []);


  // Map an API call to /api/content 
  // This will return a JSON object with the content for the page
  useEffect(() => {
    const fetchData = async () => {
      // add headers to allow all cors

      const res = await fetch(`http://localhost:3002/api/content`, {
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Type',
          'Access-Control-Allow-Private-Network': 'true',
          'Content-Type': 'application/json',
           
        },
        cache: 'default'
      });

      // const res = await fetch(`http://localhost:3002/api/content?name=hello`);
      let json;
      try{
        json = await res.json();
        console.log(json);
        setPkgContent(json);
      } catch (e) {
        console.log(e)
      }
      // const json = await res.json();
      console.log(json);
      setPkgContent(json);
    };
    fetchData();
  }, []);

  return (
    // Using tailwindcss design a page that showcases a a developers application
    // This page will be used to display the application and its features


    <>


      {/* // Banner if user doesnt upload a background image */}
      <div className="relative bg-white -mt-3 max-h-full">
        <canvas id="myCanvas" className="absolute top-0 left-0 w-full h-28 lg:h-96 z-0 rounded-xl"></canvas>
        <div className="relative z-10 rounded-b-2xl">
          <div className="sm:py-24 sm:px-6 lg:px-8 bg-opacity-30 backdrop-filter backdrop-blur-2xl h-40 lg:h-96 w-full">
            {/* <div className=""> */}

          </div>
        </div>
      </div>
      {/* // End Banner */}

      {/* // Start of the main content */}
      {/* <div className='xl:px-24 2xl:px-40 3xl:px-72'> */}
      <div className='transition-all duration-700 mx-auto xl:max-w-5xl 2xl:max-w-6xl 4xl:max-w-8xl xl:-mt-24'>
        <div className="relative bg-white -mt-3 h-8 z-10 rounded-2xl">
          <div className='bg-white rounded-2xl px-4 pt-6 md:px-28 md:pt-3 lg:px-40 lg:pt-4 mx-auto  my-8'>
            <div className='mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl'>

              {/* // Package banner stats */}
              <dl className="mx-auto grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4 mt-4">
                {stats.map((stat) => (
                  <div
                    key={stat.name}
                    className="flex flex-wrap items-baseline justify-between gap-x-1 bg-white px-4 sm:px-6 xl:px-8 text-center"
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
                    <dd className="w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900 text-center">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>


            </div>
          </div>
        </div>
        <div className='bg-white h-16 w-16 md:h-24 md:w-24 ml-7 2xl:ml-28 -mt-16 md:-mt-20 z-20 relative rounded-2xl transition-all duration-700 '>
          <img src="https://www.freepnglogos.com/uploads/512x512-logo/512x512-transparent-instagram-logo-icon-5.png" alt="Theme Icon" className="h-16 w-16 md:h-24 md:w-24 p-1" />
        </div>
        {/* <div className="hidden xl:sticky xl:top-[4.75rem] xl:-mr-6 xl:block xl:h-[calc(100vh-4.75rem)] xl:flex-none xl:overflow-y-auto xl:py-16 xl:pr-6"><nav aria-labelledby="on-this-page-title" className="w-56"><h2 id="on-this-page-title" className="font-display text-sm font-medium text-slate-900 dark:text-white">On this page</h2><ol role="list" className="mt-4 space-y-3 text-sm"><li><h3><a className="text-sky-500" href="#quick-start">Quick start</a></h3><ol role="list" className="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400"><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#installing-dependencies">Installing dependencies</a></li><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#configuring-the-library">Configuring the library</a></li></ol></li><li><h3><a className="font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300" href="#basic-usage">Basic usage</a></h3><ol role="list" className="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400"><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#your-first-cache">Your first cache</a></li><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#clearing-the-cache">Clearing the cache</a></li><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#adding-middleware">Adding middleware</a></li></ol></li><li><h3><a className="font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300" href="#getting-help">Getting help</a></h3><ol role="list" className="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400"><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#submit-an-issue">Submit an issue</a></li><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#join-the-community">Join the community</a></li></ol></li></ol></nav></div>

        <div className='relative mx-auto flex w-full max-w-8xl flex-auto justify-center sm:px-2 lg:px-8 xl:px-12 to'>
          <div className='min-w-0 max-w-2xl flex-auto px-4 py-16 lg:max-w-none lg:pl-8 lg:pr-0 xl:px-16'>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.                      </div>

        <div className="hidden xl:sticky xl:top-[4.75rem] xl:-mr-6 xl:block xl:h-[calc(100vh-4.75rem)] xl:flex-none xl:overflow-y-auto xl:py-16 xl:pr-6"><nav aria-labelledby="on-this-page-title" className="w-56"><h2 id="on-this-page-title" className="font-display text-sm font-medium text-slate-900 dark:text-white">On this page</h2><ol role="list" className="mt-4 space-y-3 text-sm"><li><h3><a className="text-sky-500" href="#quick-start">Quick start</a></h3><ol role="list" className="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400"><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#installing-dependencies">Installing dependencies</a></li><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#configuring-the-library">Configuring the library</a></li></ol></li><li><h3><a className="font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300" href="#basic-usage">Basic usage</a></h3><ol role="list" className="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400"><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#your-first-cache">Your first cache</a></li><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#clearing-the-cache">Clearing the cache</a></li><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#adding-middleware">Adding middleware</a></li></ol></li><li><h3><a className="font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300" href="#getting-help">Getting help</a></h3><ol role="list" className="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400"><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#submit-an-issue">Submit an issue</a></li><li><a className="hover:text-slate-600 dark:hover:text-slate-300" href="#join-the-community">Join the community</a></li></ol></li></ol></nav></div>
        
        </div> */}
        <div className="flex w-full max-w-full items-start gap-x-8 px-4 py-32 sm:px-6 lg:px-8">

        <main className="flex-1">
          <Prose>
            <UGCDocument source={pkgContent.content}></UGCDocument>
          </Prose>
        </main>

        <aside className="sticky top-8 hidden xl:w-96 shrink-0 xl:block">
          <Details />
        </aside>
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
