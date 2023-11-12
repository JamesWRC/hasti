'use client'
import { useState, useEffect } from 'react';
import { Box, Portal, rem, Text } from '@mantine/core';

import { useHeadroom } from '@mantine/hooks';
export default function Page({ params }: { params: { name: string } }) {
  
    const [scrollPosition, setScrollPosition] = useState(0);
    const pinned = useHeadroom({ fixedAt: 10 });


    useEffect(() => {
      const handleScroll = () => {
        setScrollPosition(window.pageYOffset);
      };
  
      window.addEventListener('scroll', handleScroll);
  
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);  
  
  
    useEffect(() => {
      const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      const randPkgName = params.name.replace(/[^a-z0-9]/gi, '');
      const moreColor = true

      // var rand = require('random-seed').create(randPkgName);
      var rand = require('random-seed').create(Math.random());
      const seed = rand.intBetween(0, 10);

      let x1, y1, x2, y2, x3, y3, rngCount=100;
      do {
        x1 = Math.floor(rand.intBetween(0, canvas.width));
        y1 = Math.floor(rand.intBetween(1, canvas.height));
  
        x2 = Math.floor(rand.intBetween(2,  canvas.width));
        y2 = Math.floor(rand.intBetween(3, canvas.height));

        x3 = Math.floor(rand.intBetween(1,  canvas.width));
        y3 = Math.floor(rand.intBetween(1, canvas.height));

        rngCount--;
        console.log(rngCount)
      } while (Math.hypot(x2 - x1, y2 - y1) <= 100 || rngCount <=0); // ensure the circles never touch
  
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
      if(moreColor){
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
  return (
    // Using tailwindcss design a page that showcases a a developers application
     // This page will be used to display the application and its features


<>


{/* // Banner if user doesnt upload a background image */}
<div className="relative bg-white -mt-3 max-h-64">
    <canvas id="myCanvas" className="absolute top-0 left-0 w-full h-full z-0"></canvas>
    <div className="relative z-10 rounded-r-2xl">
    <div className="sm:py-24 sm:px-6 lg:px-8 bg-opacity-30 backdrop-filter backdrop-blur-3xl h-full w-full">
    {/* <div className=""> */}
      <div className="text-center">
          <h2 className="text-base font-semibold text-cyan-600 tracking-wide uppercase">James Cockshott</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">{params.name}</p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus aliquid illo sint.</p>
        </div>
        </div>    
    </div>
  </div>


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
  