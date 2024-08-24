
'use client'
import React, { useEffect } from 'react';
import { auth, signOut } from "@/frontend/app/auth"
import { useRouter } from 'next/navigation';


export default function Component() {    

    const router = useRouter();

    useEffect(() => {
      const redirectToAnotherPage = () => {
        // Wait for 2 seconds (2000 milliseconds)
        setTimeout(() => {
          // Redirect to another page
          router.push('/');
          router.refresh()
        }, 2000);
      };
  
      // Call the redirect function on page load
      redirectToAnotherPage();
    }, [router]);



        return (
            <div className="container mx-auto text-center mt-10 w-max ">
                <h1 className="text-4xl font-bold mb-8">Ta Ta! <b className='text-4xl pl-3'>👋</b></h1>
                <p className="text-lg mb-8">Farewell. See ya next time! </p>
            </div>
        )
    
    
};

