import { useState, useEffect } from 'react';

import axios from 'axios';
import { GetPopularTagsQueryParams, PopularTagResponse, TagWithCount } from '@/backend/interfaces/tag/request';
import { PopularTags } from '@/frontend/interfaces/tag';
import { useDebouncedState } from '@mantine/hooks';


export default function useTags({...props}: GetPopularTagsQueryParams):PopularTags {
const [tags, setTags] = useState<PopularTagResponse>(generatePlaceHolderTags( props.limit ? parseInt(props.limit) : 10));
const [searchProps, setSearchProps] = useDebouncedState<GetPopularTagsQueryParams>(props, 1000);
const [reqStatus, setReqStatus] = useState('idle'); // idle, loading, success, error  

useEffect(() => {
    const fetchData = async () => {
        setReqStatus('loading');
      try {
        console.log("useProjects props: ", searchProps)
        //Build query string
        // Set the limit of the number of notifications to fetch
        let queryStr = searchProps.limit ? `?limit=${searchProps.limit}` : '';

        // set the project type
        if (searchProps.type) queryStr += `${queryStr ? '&' : '?'}type=${searchProps.type.toLowerCase()}`;


        console.log("searchProps server: ", searchProps)
        console.log("queryStr: ", queryStr)

        const emptyProjectsResponse:PopularTagResponse = {
          success: true,
          tags: []
        }

        // If there are no search parameters, return success with empty projects.
        if(queryStr === ''){
          setReqStatus('success');
          setTags(emptyProjectsResponse);

        
        }else{
          // Only fetch data if there are search parameters.
          
          // sleep for 2 seconds to simulate a slow network
          // await new Promise((resolve) => setTimeout(resolve, 4000));

          const response = await axios({
            url: `${process.env.API_URL}/api/v1/tags/popularTags` + queryStr,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },

            timeout: 10000,
            timeoutErrorMessage: 'Request timed out. Please try again.',
          })


          // return the projects found.
          if(response.status === 200){
            const jsonData:PopularTagResponse = response.data;
            console.log("jsonData: ", jsonData)
            setTags(jsonData);
            setReqStatus('success');
          // If HTTP 204, return success, with empty projects. As there are no projects to return.
          }else if(response.status === 204){
            setTags(emptyProjectsResponse);
            setReqStatus('success');
          }
        }
      } catch (error) {
        setReqStatus('error');
        console.error('Error fetching data:', error); 
      }
    };

    fetchData();

    return () => {
      // Cleanup function
    };
  }, [searchProps]);


    const retVal:PopularTags = {
      tags: tags,
      reqStatus,
      setSearchProps
    }
    return retVal;



};

function generatePlaceHolderTags(count:number):PopularTagResponse {
  let popularTags:TagWithCount[] = [];
  for (let i = 0; i < count; i++) {

    // const seededRand = require('random-seed').create(`A ${i}` )
    // const seededRand = require('random-seed').create(`E${i}` )
    // const seededRand = require('random-seed').create(`H${i}` )
    // const seededRand = require('random-seed').create(`H${i}` )

    const random = Math.floor(Math.random() * 1000) + 1;


    const popularTag:TagWithCount = {
        name: `Tag ${i}`,
        count: random,
      }

    popularTags.push(popularTag);
  }
  return {
    success: true,
    tags: popularTags
  }
}
