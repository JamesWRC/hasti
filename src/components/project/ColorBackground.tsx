'use client'
import { useState, useEffect } from 'react';




export default function ColorBackground({ projectID }: { projectID: string }) {

    // Handle the canvas that renders random color hues 
    useEffect(() => {
        const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        const moreColor = true
        var rand = require('random-seed').create(projectID);

        let x1, y1, x2, y2, x3, y3, x4, y4, rngCount = 100;
        do {
            x1 = Math.floor(rand.intBetween(0, canvas.width));
            y1 = Math.floor(rand.intBetween(1, canvas.height*2));

            x2 = Math.floor(rand.intBetween(2, canvas.width));
            y2 = Math.floor(rand.intBetween(3, canvas.height*5));

            x3 = Math.floor(rand.intBetween(1, canvas.width));
            y3 = Math.floor(rand.intBetween(1, canvas.height/2));

            x4 = Math.floor(rand.intBetween(1, canvas.width/7));
            y4 = Math.floor(rand.intBetween(1, canvas.height*2));

            rngCount--;
            console.log(rngCount)
        } while (Math.hypot(x2 - x1, y2 - y1, x1-x3, y1-y3) <= 100 || rngCount <= 0); // ensure the circles never touch

        const rotation = rand.random() * 1 * 0.025; // random rotation in radians

        if (!ctx) return;
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

        ctx.save(); // save the current state
        ctx.rotate(rotation); // rotate the canvas


        const hue = Math.floor(rand.random() * 360);

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
            const hue2 = Math.floor(rand.random() * 360);

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
        <canvas id="myCanvas" className="absolute top-0 left-0 w-full h-48 z-0 bg-gray-800"></canvas>
    )
}