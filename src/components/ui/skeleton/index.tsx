'use client'
import React, { useEffect, useState } from "react";
import { Skeleton } from "@mantine/core";


// Generate a function will return a skelton that wil have random  amounts to make it look more realistic
export function DynamicSkeletonTitle({max=10, min=4, maxWidth=200}: {max: number, min: number, maxWidth?:number}) {
    // const [random, setRandom] = useState(0);

    // useEffect(() => {
    //     // Generate random number on initial render
    //     const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    //     setRandom(randomValue);
    // }, []);

    return (
        <div className="skeleton__text flex flex-wrap">
            {Array(Math.floor(Math.random() * (max - min + 1)) + min).fill(0).map((_, i) => (
                <div key={i}>
                    <Skeleton height={16} mt={6} radius="xl" width={generateRandomTitleWidth(maxWidth)} className="mr-1.5"/>
                </div>
            ))}
        </div>
    );
}


export function DynamicSkeletonImage({height=10, width=4, maxWidth=200}: {height: number, width: number, maxWidth?:number}) {
    const randomValue = Math.floor(Math.random() * (1000 - 4 + 1)) + 4;

    return (
        // <div className="skeleton__text flex flex-wrap">
        //     <div key={`skeleton-image-${randomValue}`}>
        //         <Skeleton height={height} width={width} mt={6} radius="xl" className="mr-1.5"/>
        //     </div>
        // </div>
        <div role="status" className="animate-pulse skeleton__text flex flex-wrap">
            <div className="m-1 px-0.5 ">
                <div className={`flex items-center justify-center w-[60rem] h-80 bg-gray-300 rounded-2xl dark:bg-gray-700`}></div>
            </div>
    </div>
    );
}

// Generate a function will return a skelton that wil have random  amounts to make it look more realistic
export function DynamicSkeletonText({max=30, min=6, maxWidth=100}: {max: number, min: number, maxWidth:number}) {

    return (
        // <div className="skeleton__text flex flex-wrap">
        //     {Array(Math.floor(Math.random() * (max - min + 1)) + min).fill(0).map((_, i) => (
        //         <div key={i}>
        //             <Skeleton height={10} mt={6} radius="xl" width={generateRandomTextWidth()} className="mr-1.5 opacity-75"/>
        //         </div>
        //     ))}
        // </div>

        <div role="status" className="animate-pulse skeleton__text flex flex-wrap">
            {Array(Math.floor(Math.random() * (max - min + 1)) + min).fill(0).map((_, i) => (
                <div key={i} className="m-0.5 px-0.5 ">
                    <div className={`flex items-center justify-center ${generateRandomTextWidth(maxWidth)} h-5 bg-gray-300 rounded-full dark:bg-gray-700`}></div>
                </div>
            ))}
        </div>

    );
}

function generateRandomTitleWidth(maxWidth=200)  {
    return Math.floor(Math.random() * (maxWidth - 40 + 1)) + 40;
}

function generateRandomTextWidth(maxWidth = 100) {
    // Define Tailwind width classes from w-1 (0.25rem) to w-96 (24rem)
    const widthClasses = [
        // 'w-1',   // 0.25rem
        // 'w-2',   // 0.5rem
        // 'w-3',   // 0.75rem
        // 'w-4',   // 1rem
        // 'w-5',   // 1.25rem
        // 'w-6',   // 1.5rem
        'w-7',   // 1.75rem
        'w-8',   // 2rem
        'w-9',   // 2.25rem
        'w-10',  // 2.5rem
        'w-11',  // 2.75rem
        'w-12',  // 3rem
        'w-16',  // 4rem
        'w-20',  // 5rem
        'w-24',  // 6rem
        'w-28',  // 7rem
        'w-32',  // 8rem
        'w-36',  // 9rem
        'w-40',  // 10rem
        'w-44',  // 11rem
        'w-48',  // 12rem
        'w-52',  // 13rem
        'w-56',  // 14rem
        'w-60',  // 15rem
        'w-64',  // 16rem
        'w-72',  // 18rem
        'w-80',  // 20rem
        'w-96'   // 24rem
    ];

    // Calculate the maximum width in rem that corresponds to the maxWidth percentage
    const maxRem = (maxWidth / 100) * 24; // 24rem is the max width for w-96

    // Filter the width classes to only include those up to the maxRem
    const filteredWidthClasses = widthClasses.filter(widthClass => {
        const remValue = parseInt(widthClass.replace('w-', '')) * 0.25;
        return remValue <= maxRem;
    });

    // Return a random width class from the filtered list
    const randomIndex = Math.floor(Math.random() * filteredWidthClasses.length);
    return filteredWidthClasses[randomIndex];
}