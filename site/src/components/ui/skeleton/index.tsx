'use client'
import React, { useEffect, useState } from "react";
import { Skeleton } from "@mantine/core";


// Generate a function will return a skelton that wil have random  amounts to make it look more realistic
export function DynamicSkeletonTitle() {
    const [random, setRandom] = useState(0);

    useEffect(() => {
        // Generate random number on initial render
        const randomValue = Math.floor(Math.random() * (10 - 4 + 1)) + 4;
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

// Generate a function will return a skelton that wil have random  amounts to make it look more realistic
export function DynamicSkeletonText() {
    const [random, setRandom] = useState(0);

    useEffect(() => {
        // Generate random number on initial render
        const randomValue = Math.floor(Math.random() * (30 - 6 + 1)) + 6;
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