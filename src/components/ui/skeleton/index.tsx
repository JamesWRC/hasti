'use client'
import React, { useEffect, useState } from "react";
import { Skeleton } from "@mantine/core";


// Generate a function will return a skelton that wil have random  amounts to make it look more realistic
export function DynamicSkeletonTitle({max=10, min=4}: {max: number, min: number}) {
    const [random, setRandom] = useState(0);

    useEffect(() => {
        // Generate random number on initial render
        const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
        setRandom(randomValue);
    }, []);

    return (
        <div className="skeleton__text flex flex-wrap">
            {Array(random).fill(0).map((_, i) => (
                <div key={i}>
                    <Skeleton height={16} mt={6} radius="xl" width={generateRandomTitleWidth()} className="mr-1.5"/>
                </div>
            ))}
        </div>
    );
}


export function DynamicSkeletonImage({height=10, width=4}: {height: number, width: number}) {
    const randomValue = Math.floor(Math.random() * (1000 - 4 + 1)) + 4;

    return (
        <div className="skeleton__text flex flex-wrap">
            <div key={`skeleton-image-${randomValue}`}>
                <Skeleton height={height} width={width} mt={6} radius="xl" className="mr-1.5"/>
            </div>
        </div>
    );
}

// Generate a function will return a skelton that wil have random  amounts to make it look more realistic
export function DynamicSkeletonText({max=30, min=6}: {max: number, min: number}) {
    const [random, setRandom] = useState(0);

    useEffect(() => {
        // Generate random number on initial render
        const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
        setRandom(randomValue);
    }, []);

    return (
        <div className="skeleton__text flex flex-wrap">
            {Array(random).fill(0).map((_, i) => (
                <div key={i}>
                    <Skeleton height={10} mt={6} radius="xl" width={generateRandomTextWidth()} className="mr-1.5 opacity-75"/>
                </div>
            ))}
        </div>
    );
}

function generateRandomTitleWidth()  {
    return Math.floor(Math.random() * (200 - 40 + 1)) + 40;
}

function generateRandomTextWidth()  {
    return Math.floor(Math.random() * (100 - 25 + 1)) + 25;
}