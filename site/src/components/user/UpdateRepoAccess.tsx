"use client"
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { GitHubUserTokenRequest } from '@/backend/interfaces/user/requests'


export default function UpdateRepoAccess() {
    const { data: session, status } = useSession()

    const searchParams = useSearchParams()

    const [updateStage, setUpdateStage] = useState([
        { name: 'Received GitHub OAuth Code', href: '#', status: 'complete' },
        { name: 'Exchanging OAuth code for token', href: '#', status: 'current' },
        { name: 'Testing Access Token', href: '#', status: 'upcoming' },
        { name: 'Successfully updated', href: '#', status: 'upcoming' },
      ]);

      function updateStageStatus(statusIndex: number, status: string){
        setUpdateStage(prevState => {
            const updatedStages = [...prevState];
            updatedStages[statusIndex].status = status;
            if(statusIndex < updatedStages.length -1){
                updatedStages[statusIndex+1].status = 'current';
            }
            return updatedStages;
        });
      }

      useEffect(() => {
        const fetchData = async () => {
          if(session){
            const user:User = session.user
            
            const code = searchParams.get('code') as string
            const installation_id = searchParams.get('installation_id') as string
            const setup_action = searchParams.get('setup_action') as string

            const reqBody:GitHubUserTokenRequest = {
              code: code,
              installation_id: installation_id,
              state: setup_action
            }
            try {
              // API Call 1
              const response1 = await fetch(`${process.env.API_URL}/api/auth/gitUserToken`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + user.jwt
                  },
                  body: JSON.stringify(reqBody),
                });
                updateStageStatus(1, 'complete')
              await new Promise(resolve => setTimeout(resolve, 4000));

              // API Call 2
              const response2 = await fetch(`${process.env.API_URL}/api/content`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  cache: 'default'
                });
                updateStageStatus(2, 'complete')

              await new Promise(resolve => setTimeout(resolve, 1000));

              // API Call 3
              const response3 = await fetch(`${process.env.API_URL}/api/content`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  cache: 'default'
                });
                updateStageStatus(3, 'complete')

              } catch (error) {
              console.error('Error fetching data:', error);
            }
          }
        };
    
        // Call the fetchData function on component mount
        fetchData();
      }, []); // Empty dependency array ensures the effect runs only once on mount
    

    // Used to handle the redirect from the OAuth flow for github app
    if(searchParams.get('code') && searchParams.get('installation_id') && searchParams.get('setup_action') && searchParams.get('state')){
        const code = searchParams.get('code')
        const installation_id = searchParams.get('installation_id')
        const setup_action = searchParams.get('setup_action')
        const state = searchParams.get('state')
        
        // const updateStage = [
        //     { name: 'Received GitHub OAuth Code', href: '#', status: 'complete' },
        //     { name: 'Exchanging OAuth code for token', href: '#', status: 'current' },
        //     { name: 'Testing Access Token', href: '#', status: 'upcoming' },
        //     { name: 'Successfully updated', href: '#', status: 'upcoming' },
        //   ]
          

          

    return (
        <div className="px-4 py-12 sm:px-6 lg:px-8">
        <nav className="flex justify-center" aria-label="Progress">
            <ol role="list" className="space-y-6">
            {updateStage.map((stage) => (
                <li key={stage.name}>
                {stage.status === 'complete' ? (
                    <a className="group">
                    <span className="flex items-start">
                        <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                        <CheckCircleIcon
                            className="h-full w-full text-green-600 group-hover:text-green-800"
                            aria-hidden="true"
                        />
                        </span>
                        <span className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                        {stage.name}
                        </span>
                    </span>
                    </a>
                ) : stage.status === 'current' ? (
                    <a className="flex items-start" aria-current="step">
                    <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center" aria-hidden="true">
                        <span className="animate-ping absolute h-3 w-3 rounded-full bg-blue-200" />
                        <span className="relative block h-2 w-2 rounded-full bg-blue-600" />
                    </span>
                    <span className="ml-3 text-sm font-medium text-indigo-600">{stage.name}</span>
                    </a>
                ) : (
                    <a className="group">
                    <div className="flex items-start">
                        <div className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center" aria-hidden="true">
                        <div className="h-2 w-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                        </div>
                        <p className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">{stage.name}</p>
                    </div>
                    </a>
                )}
                </li>
            ))}
            </ol>
        </nav>
        </div>
    )
    }else{
        return (<></>)
    }
}
