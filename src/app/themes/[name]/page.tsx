'use client'
import { useState, useEffect } from 'react';
import { Box, Portal, rem, Text } from '@mantine/core';

import { Prose } from '@/frontend/components/markdoc/Prose';

import Details from '@/frontend/components/store/content/Details';
import { useHeadroom } from '@mantine/hooks';

import UGCDocument from '@/frontend/components/store/content/UGCDocument';
import TableOfContents from '@/frontend/components/store/content/TableOfContents';

import Prism from 'prismjs';
import '@/frontend/app/prism.css'
import ColorBackground from '@/frontend/components/project/ColorBackground';
// import prism from "prismjs";

// import 'prismjs/components/prism-json'; // need this

export default function Page({ params }: { params: { name: string } }) {

  const [scrollPosition, setScrollPosition] = useState(0);
  const pinned = useHeadroom({ fixedAt: 10 });
  const [pkgContent, setPkgContent] = useState({} as any);

  const stats = [
    { name: 'Type', value: 'Theme', change: '', changeType: 'positive' },
    { name: 'Compatibility', value: 'Core', change: '', changeType: 'negative' },
    { name: 'Release', value: '3.2', change: '', changeType: 'positive' },
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

  // // Handle the canvas that renders random color hues 
  // useEffect(() => {
  //   const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
  //   const ctx = canvas.getContext('2d');
  //   const randPkgName = params.name.replace(/[^a-z0-9]/gi, '');
  //   const moreColor = true

  //   // var rand = require('random-seed').create(randPkgName);
  //   var rand = require('random-seed').create(Math.random());
  //   const seed = rand.intBetween(0, 10);

  //   let x1, y1, x2, y2, x3, y3, rngCount = 100;
  //   do {
  //     x1 = Math.floor(rand.intBetween(0, canvas.width));
  //     y1 = Math.floor(rand.intBetween(1, canvas.height));

  //     x2 = Math.floor(rand.intBetween(2, canvas.width));
  //     y2 = Math.floor(rand.intBetween(3, canvas.height));

  //     x3 = Math.floor(rand.intBetween(1, canvas.width));
  //     y3 = Math.floor(rand.intBetween(1, canvas.height));

  //     rngCount--;
  //     console.log(rngCount)
  //   } while (Math.hypot(x2 - x1, y2 - y1) <= 100 || rngCount <= 0); // ensure the circles never touch

  //   const rotation = Math.random() * 1 * 0.025; // random rotation in radians

  //   if (!ctx) return;
  //   const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  //   // gradient.addColorStop(0, 'cyan');
  //   // gradient.addColorStop(1, 'red');

  //   ctx.save(); // save the current state
  //   ctx.rotate(rotation); // rotate the canvas


  //   const hue = Math.floor(Math.random() * 360);

  //   // Generate complementary hue
  //   const complementaryHue = (hue + 140) % 360;

  //   // Convert hues to CSS HSL strings
  //   const color1 = `hsl(${hue}, 100%, 50%)`;
  //   const color2 = `hsl(${complementaryHue}, 100%, 50%)`;

  //   gradient.addColorStop(0, color1);
  //   gradient.addColorStop(1, color2);

  //   ctx.beginPath();

  //   ctx.arc(x1, y1, 7.5, 0, 2 * Math.PI, false);
  //   ctx.arc(x2, y2, 7.5, 0, 2 * Math.PI, false);

  //   const distanceToEdge = Math.min(x1, y1, canvas.width - x1, canvas.height - y1);

  //   ctx.shadowBlur = (canvas.width / 2 - distanceToEdge) / 2;

  //   ctx.arc(x3, y3, rand.intBetween(10, 25), 0, 2 * Math.PI, false);

  //   ctx.arc(0, y1 - 50, 7.5, 0, 2 * Math.PI, false);
  //   ctx.arc(100, 100, 15, 20, 2 * Math.PI, false);

  //   ctx.fillStyle = gradient;
  //   if (moreColor) {
  //     const hue2 = Math.floor(Math.random() * 360);

  //     // Generate complementary hue
  //     const complementaryHue2 = (hue2 + 140) % 360;

  //     // Convert hues to CSS HSL strings
  //     const color21 = `hsl(${hue2}, 100%, 50%)`;
  //     const color22 = `hsl(${complementaryHue2}, 100%, 50%)`;
  //     const gradient2 = ctx.createLinearGradient(0, 0, 0, canvas.height);

  //     gradient2.addColorStop(0, color21);
  //     gradient2.addColorStop(1, color22);


  //     ctx.arc(canvas.width, canvas.height, rand.intBetween(10, 25), 0, 2 * Math.PI, false);
  //     ctx.fillStyle = gradient2;
  //   }


  //   ctx.fill();
  // }, []);


  // Map an API call to /api/content 
  // This will return a JSON object with the content for the page
  useEffect(() => {
    const fetchData = async () => {
      // add headers to allow all cors
      const res = await fetch(`${process.env.API_URL}/api/content`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'default'
      });

      // const res = await fetch(`http://localhost:3002/api/content?name=hello`);
      let json;
      try {
        json = await res.json();
        console.log("setPkgContent", json);
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

  function renderDetails() {
    return (
      <aside className="transition-all duration-700 sticky top-8 xl:w-96 shrink-0 2xl:-mr-16 3xl:-mr-32 5xl:-mr-80 ">
        <Details />
      </aside>

    )
  }


  function renderTableOfContents() {
    return (
      <aside className="transition-all duration-700 sticky top-8 xl:w-96 shrink-0 2xl:-mr-16 3xl:-mr-32 5xl:-mr-80 ">
        <TableOfContents />
        <div>
          Hello worl, abit about the author blah blah balj
        </div>
      </aside>

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
        <ColorBackground projectID={"b"}/>
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
                {stats.map((stat) => (
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
                    <dd className="w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900 text-center">
                      {stat.value}
                    </dd>
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

        {/* // user generated content */}
        <div className="flex w-full max-w-full items-start gap-x-8 px-4 py-32 sm:px-6 lg:px-8 z-10">

          <main className="flex-1">

            <Prose>
              {pkgContent && pkgContent.content ? <UGCDocument source={pkgContent.content}></UGCDocument> : null}
            </Prose>
            {/* <div className='block xl:hidden'>
              {renderDetails()}
            </div> */}
          </main>
          <div className='hidden xl:block sticky top-0'>
            <div className=''>
              {renderTableOfContents()}
            </div>
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
