'use client'

import { Project, getAllProjectTypes } from '@/backend/interfaces/project';
import { GetPopularTagsQueryParams, PopularTagResponse, TagSearchResponse, TagWithCount } from '@/backend/interfaces/tag/request';
import { AdjustmentsVerticalIcon, ChevronDoubleDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
// Make a search Bar component

import { Box, Button, CloseButton, Collapse, Group, Input, Radio, RadioGroup, Text } from '@mantine/core';
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from 'react';
import useTags from '@/frontend/components/tag';
import { PopularTags } from '@/frontend/interfaces/tag';
import { DynamicSkeletonTitle } from '@/frontend/components/ui/skeleton';
import SearchTagComboBox from '@/frontend/components/ui/SearchComboBox';
import axios from 'axios';
import { SearchParams } from '@/backend/interfaces/tag';



export default function Search() {
  const initParams = new URLSearchParams(new URL(window.location.href).searchParams);

  //Search
  const [search, setSearch] = useState('');
  const [debounceValue, setDebounceValue] = useDebouncedState('', 750);


  const [opened, { toggle }] = useDisclosure(true);
  const [projectTypeSelected, setProjectTypeSelected] = useState(initParams.get('type') || 'Any');

  // Tags
  const { tags, reqStatus, setSearchProps } = useTags({ limit: '50' });
  // Results has tags
  const [hasTags, setHasTags] = useState<string[]>(initParams.get('hasTags')?.split(',') || []);
  // Must not have tags
  const [notTags, setNotTags] = useState<string[]>(initParams.get('notTags')?.split(',') || []);


  const tagSearchParams: SearchParams = {
    q: '*',
    query_by: 'name',
    include_fields: 'name,type',
    highlight_fields: 'name', // Hacky way to get API to not send highlight fields in response to save response size
    // sort_by: 'projectsUsing:desc',
    typo_tokens_threshold: 3,
  }

  const projectSearchParams: SearchParams = {
    q: '*',
    query_by: 'title,description,tagNames',
    include_fields: '*',
    filter_by: "(tagNames:='test' || tagNames:='test1') && tagNames:!='3' && popularityRating:>=0 && popularityRating:<=95",
    // sort_by: 'projectsUsing:desc',
    typo_tokens_threshold: 3,
  }

  if(projectTypeSelected && projectTypeSelected !== 'Any'){
    tagSearchParams.filter_by = `type:${projectTypeSelected?.toLowerCase()}`
  }


  function handleSearch(value: string) {
    setSearch(value)
    setDebounceValue(value)
  }
  

  useEffect(() => {
    if (projectSearchParams && debounceValue != '') {
        const searchProjects = async () => {
            
            // Set the search query
            projectSearchParams.q = debounceValue
            const params = new URLSearchParams(projectSearchParams as Record<string, any>)

            const res = await axios({
                url: `${process.env.API_URL}/api/v1/projects/search?` + params,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
                timeoutErrorMessage: 'Request timed out. Please try again.',
              })

            const tagSearchResponse: TagSearchResponse = res.data;
            const projects:Project[] = tagSearchResponse.hits.map((hit) => hit.document as unknown as Project)
            console.log("tagSearchResponse: ", tagSearchResponse)
            console.log("projects: ", projects.map((project) => project.popularityRating))
            const tags = tagSearchResponse.hits.map((hit) => hit.document.name)

        }
        searchProjects()

    }
}, [debounceValue]);


  // Handle Project type selection
  function handleProjectTypeSelection(value: string) {

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    // Handle 'Any' selection
    if (value === 'Any') {
      params.delete('type');
      setProjectTypeSelected('Any');
      setSearchProps({ limit: '50' })
    } else if (projectTypeSelected !== value) {
      // Set the url params for the project type

      params.set('type', value);
      setProjectTypeSelected(value);
      setSearchProps({ limit: '50', type: value })

    } else if (projectTypeSelected === value) {
      params.delete('type');
      setProjectTypeSelected('');

    }

    url.search = params.toString();
    window.history.pushState({}, '', url.toString());
  }

  // Handle Tags selection
  function handleSelectedTags(value: string) {
    let newHasTags: string[] = []
    let newNotTags: string[] = []
    if (hasTags.includes(value) && !notTags.includes(value)) {
      // Remove the tag from the hasTags array
      newHasTags = hasTags.filter(tag => tag !== value);
      // Add the tag to the notTags array
      newNotTags = [...notTags, value];

    } else if (notTags.includes(value)) {
      // Remove the tag from the notTags array
      newNotTags = notTags.filter(tag => tag !== value);

    } else {
      // Create a new array instead of mutating the existing one
      newHasTags = [...hasTags, value];
      newNotTags = notTags
    }
    setHasTags(newHasTags);
    setNotTags(newNotTags);

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    // Set the url params for the hasTags
    if (newHasTags.length > 0) {
      params.set('hasTags', newHasTags.join(','));
    } else {
      params.delete('hasTags');
    }

    // Set the url params for the notTags
    if (newNotTags.length > 0) {
      params.set('notTags', newNotTags.join(','));
    } else {
      params.delete('notTags');
    }

    url.search = params.toString();
    window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));
  }




  function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }
  return (
    <>

      <div className='grid grid-cols-1 max-w-lg mx-auto pt-4 sticky top-0 z-30 pl-2 pr-1 -mt-24'>
        <Input
          placeholder="Search Integrations, Themes etc..."
          value={search}
          onChange={(event) => handleSearch(event.currentTarget.value)}
          rightSectionPointerEvents="all"
          className='z-20 shadow-lg block w-full p-2 ps-10 text-sm text-white rounded-2xl bg-dark focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-200 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
          leftSection={<MagnifyingGlassIcon className='h-5 w-5 ml-1 font-bold text-white' />}
          styles={{ input: { paddingLeft: '0px', border: '0px', backgroundColor: 'rgb(38 40 43 / var(--tw-bg-opacity))', color: 'white' } }}
          rightSection={
            <div className='flex -ml-5'>
              <CloseButton
                className='text-white -ml-5'
                aria-label="Clear input"
                onClick={() => handleSearch('')}
                style={{ display: search ? undefined : 'none' }}
              />
              <div className={search ? 'hidden' : 'px-1'}></div>
              <AdjustmentsVerticalIcon onClick={toggle} className={'h-5 w-5 text-white cursor-pointer my-1 '} />

            </div>

          }
        />
        <div className={search || opened ? 'max-w-lg w-full grid grid-cols-1 z-10 pt-14 rounded-2xl absolute overscroll-none' : 'hidden'}>
          <div className='rounded-2xl bg-white shadow-4xl -mt-10 pt-12 px-4 mx-3'>
          <div className={opened ? 'mx-4 rounded-b-2xl bg-gray-50 pt-4' : 'hidden'}>
            <div className='grid grid-cols-3 gap-4'>
              {/* Get Types */}
              <div className='text-md font-bold col-span-2 my-auto'>Project Types</div>
              <div key={`Any-select`} className='py-2'>
                      <Button

                        onClick={() => handleProjectTypeSelection('Any')}
                        className={`min-w-full transition duration-200 ${projectTypeSelected === 'Any' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-400 hover:text-white rounded-lg py-2 px-4`}
                      >
                        Any
                      </Button>
                      <br />
                    </div>
              {/* <div className='mx-auto'> */}
                {
                  [...getAllProjectTypes(true)].map((type: string) => {
                    return <div key={`${type}-select`} className='py-2'>
                      <Button

                        onClick={() => handleProjectTypeSelection(type)}
                        className={`min-w-full transition duration-200 ${projectTypeSelected === type ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-400 hover:text-white rounded-lg py-2 px-4`}
                      >
                        {type}
                      </Button>
                      <br />
                    </div>
                  })
                }
              {/* </div> */}
              {/* Popular tags - scroll box  */}
              <div className='mx-auto col-span-3 '>
                <div className='text-md font-bold'>Popular {projectTypeSelected !== 'Any' ? projectTypeSelected : null} Tags</div>
                <div className='overflow-y-auto h-40 mt-2'>
                  <div className='flex flex-wrap'>
                    {reqStatus === 'success' && tags ?
                      tags.tags.map((tag: TagWithCount) => {
                        return <button key={tag.name} onClick={(e) => { handleSelectedTags(tag.name) }} className={
                          classNames('border border-gray-700 bg-gray-100 text-gray-800 hover:bg-blue-400 hover:text-white rounded-lg m-1 px-2 text-xs font-semibold p-1 cursor-pointer', hasTags.includes(tag.name) ? 'bg-purple-400' : notTags.includes(tag.name) ? 'bg-red-400' : '')}>{`${tag.name}`}<span className='text-xs pl-1 font-light'>{`(${tag.count})`}</span></button>
                      })
                      : tags && tags.tags.map((tag: TagWithCount) => {
                        return <button key={tag.name} className='border border-gray-700 bg-gray-100 text-gray-800 hover:bg-blue-400 hover:text-white rounded-lg m-1 px-2 text-xs font-semibold p-1'><DynamicSkeletonTitle min={1} max={1} maxWidth={75} /></button>
                      })
                    }
                  </div>
                </div>
              </div>
              <div className='col-span-3'>
                Has these tags:
              {/* Results must include these tags */}
              <SearchTagComboBox
                placeholder="Results must include..."
                searchable={true}
                nothingFoundMessage='Nothing found...'
                existingTags={hasTags}
                tags={hasTags} setTags={setHasTags}
                maxSelectedValues={10}
                searchParams={tagSearchParams}

              />
              </div>
              <div className='col-span-3'>
                Doesn&apos;t have these tags:
              {/* Results must include these tags */}
              <SearchTagComboBox
                placeholder="Results won't include..."
                searchable={true}
                nothingFoundMessage='Nothing found...'
                existingTags={notTags}
                tags={notTags} setTags={setNotTags}
                maxSelectedValues={10}
                searchParams={tagSearchParams}
              />
              </div>
            </div>
          </div>
          {/* Show the results from the search */}
            <Text className='text-white text-sm font-semibold '>Results</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
            <Text className='text-white text-sm font-semibold ml-1'>0</Text>
          </div>
        </div>
      </div>

    </>
  )
}