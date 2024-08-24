import { useState, useEffect, useRef } from 'react';

import { useSession } from 'next-auth/react'
import axios from 'axios';
import { GetUsersQueryParams, GetUsersResponse } from '@/backend/interfaces/user/request';
import { LoadUsers } from '@/frontend/interfaces/user';
import { User } from '@/backend/interfaces/user';


export default function useUsers({ ...props }: GetUsersQueryParams): LoadUsers {
    const [searchProps, setSearchProps] = useState<GetUsersQueryParams>(props);

    const [users, setUsers] = useState<GetUsersResponse>(generatePlaceHolderProjects(props.limit || 10));
    const [reqStatus, setReqStatus] = useState('idle'); // idle, loading, success, error

    const { data: session, status } = useSession()
    const initialRender = useRef(true);

    const fetchData = async () => {
        setReqStatus('loading');
        try {
            //Build query string
            // Set the limit of the number of users to fetch
            let queryStr = searchProps.limit ? `?limit=${searchProps.limit}` : '';

            // set the username if it exists
            if (searchProps.username) queryStr += `${queryStr ? '&' : '?'}username=${searchProps.username}`;

            // set orderBy if it exists
            if (searchProps.orderBy) queryStr += `${queryStr ? '&' : '?'}orderBy=${searchProps.orderBy}`;

            // set orderDirection if it exists
            if (searchProps.orderDirection) queryStr += `${queryStr ? '&' : '?'}orderDirection=${searchProps.orderDirection}`;

            // skip if it exists
            if (searchProps.skip) queryStr += `${queryStr ? '&' : '?'}skip=${searchProps.skip}`;

            
            

            console.log("searchProps server: ", searchProps)
            console.log("queryStr: ", queryStr)

            const emptyUsersResponse: GetUsersResponse = {
                success: true,
                users: [],
                totalUsers: 0
            }

            // If there are no search parameters, return success with empty projects.
            if (queryStr === '') {
                setReqStatus('success');
                setUsers(emptyUsersResponse);


            } else {
                // Only fetch data if there are search parameters.

                // sleep for 2 seconds to simulate a slow network
                // await new Promise((resolve) => setTimeout(resolve, 4000));

                const response = await axios({
                    url: `${process.env.API_URL}/api/v1/user/` + queryStr,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.user.jwt}`
                    },

                    timeout: 10000,
                    timeoutErrorMessage: 'Request timed out. Please try again.',
                })


                // return the projects found.
                if (response.status === 200) {
                    const jsonData: GetUsersResponse = response.data;
                    console.log("jsonData: ", jsonData)
                    setUsers(jsonData);
                    setReqStatus('success');
                    // If HTTP 204, return success, with empty projects. As there are no projects to return.
                } else if (response.status === 204) {
                    setUsers(emptyUsersResponse);
                    setReqStatus('success');
                }
            }
        } catch (error) {
            setReqStatus('error');
            console.error('Error fetching data:', error);
        }
    };

    // fetchData();

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
        } else {
            fetchData();
        }
        fetchData();

    }, [searchProps]);


    const retVal: LoadUsers = {
        users: users.users,
        totalUsers: users.totalUsers,
        reqStatus,
        setSearchProps
    }
    return retVal;



};

function generatePlaceHolderProjects(count: number): GetUsersResponse {
    let dummyUsers = [];
    for (let i = 0; i < count; i++) {

        // const seededRand = require('random-seed').create(`A ${i}` )
        // const seededRand = require('random-seed').create(`E${i}` )
        // const seededRand = require('random-seed').create(`H${i}` )
        // const seededRand = require('random-seed').create(`H${i}` )

        const random = Math.floor(Math.random() * 1000) + 1;


        const dummyUser: User = {
            id: random.toString(),
            githubID: random,
            githubNodeID: random.toString(),
            username: "username" + random.toString(),
            image: "https://avatars.githubusercontent.com/u/1?v=4",
            type: "user",
            ghuToken: "ghuToken",
            createdAt: new Date(),
            updatedAt: new Date()
        }
        dummyUsers.push(dummyUser);
    }

    return {
        success: true,
        users: dummyUsers,
        totalUsers: dummyUsers.length
    }
}
