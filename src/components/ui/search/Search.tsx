'use client'

import { IoTClassifications, Project, ProjectType, getAllProjectTypes, getProjectType } from '@/backend/interfaces/project';
import { GetPopularTagsQueryParams, PopularTagResponse, TagSearchResponse, TagWithCount } from '@/backend/interfaces/tag/request';
import { AdjustmentsVerticalIcon, ChevronDoubleDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
// Make a search Bar component

import { Box, Button, CloseButton, Collapse, Group, Input, Radio, RadioGroup, RangeSlider, Text } from '@mantine/core';
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from 'react';
import useTags from '@/frontend/components/tag';
import { PopularTags } from '@/frontend/interfaces/tag';
import { DynamicSkeletonTitle } from '@/frontend/components/ui/skeleton';
import SearchTagComboBox from '@/frontend/components/ui/SearchComboBox';
import axios from 'axios';
import { SearchParams } from '@/backend/interfaces/tag';
import { HAInstallTypeSelectDropdownBox } from '../HAInstallTypeSelectDropdownBox';
import { StyledComboBox } from '../StyledComboBox';
import { ComboBoxWithHeader } from '@/frontend/components/ui/ComboBoxWithHeader';
import { HAInstallType } from '@/backend/interfaces/project'

import { getIoTClassificationComboBoxItems } from '@/frontend/components/ui/project/index';
import { HACoreVersions } from '@/backend/helpers/homeassistant';
import { IoTClassificationHelp, HAVersionHelp, ProjectTypeHelp } from '../HelpDialogs';
import { getIoTClassificationType } from '../../../../backend/codebase/app/interfaces/project/index';
import { ProjectTypeSelectDropdownBox } from '@/frontend/components/ui/ProjectTypeSelectDropdownBox';

import { rngAvatarBackground } from "@/frontend/components/ui/project";
import React from 'react';


export default function Search() {
  const initParams = new URLSearchParams(new URL(window.location.href).searchParams);

  //Search
  const [search, setSearch] = useState(initParams.get('search') || '');
  const [debounceValue, setDebounceValue] = useDebouncedState('', 750);


  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [projectTypeSelected, setProjectTypeSelected] = useState(initParams.get('type') ? getProjectType(initParams.get('type') as string) : undefined);

  // Tags
  const { tags, reqStatus, setSearchProps } = useTags({ limit: '50' });
  // Results has tags
  const [hasTags, setHasTags] = useState<string[]>(initParams.get('hasTags')?.split(',') || []);
  // Must not have tags
  const [notTags, setNotTags] = useState<string[]>(initParams.get('notTags')?.split(',') || []);

  const stringHAInstallTypes = initParams.get('haInsTypes')?.split(',')?.filter((type) => Object.values(HAInstallType).includes(type as HAInstallType));
  const [haInstallTypes, setHaInstallTypes] = useState<HAInstallType[]>(stringHAInstallTypes ? stringHAInstallTypes.map((type) => type as HAInstallType) || [HAInstallType.ANY] : [HAInstallType.ANY]);


  // Home Assistant Install Versions
  const [worksWithHAVersion, setWorksWithHAVersion] = useState<string>(initParams.get('haVer') || '');

  // SetUp IoTClassification combo
  const [IoTClassification, setIotClassification] = useState<IoTClassifications | undefined>(initParams.get('iotClass') ? getIoTClassificationType(initParams.get('iotClass') as string) : undefined);

  // sliders
  const [rating, setRating] = useState<[number, number]>([parseInt(initParams.get('rMin') || "10"), parseInt(initParams.get('rMax') || "100")]);
  const [activity, setActivity] = useState<[number, number]>([parseInt(initParams.get('aMin') || "10"), parseInt(initParams.get('aMax') || "100")]);
  const [popularity, setPopularity] = useState<[number, number]>([parseInt(initParams.get('pMin') || "10"), parseInt(initParams.get('pMax') || "100")]);

  // The returned projects that were yielded from the search
  const [searchResults, setSearchResults] = useState<Project[]>([]);

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
    filter_by: "",
    // filter_by: "(tagNames:='test' || tagNames:='test1') && tagNames:!='3' && popularityRating:>=0 && popularityRating:<=95",
    // sort_by: 'projectsUsing:desc',
    typo_tokens_threshold: 3,
  }

  if (projectTypeSelected && projectTypeSelected !== undefined) {
    tagSearchParams.filter_by = `type:${projectTypeSelected?.toLowerCase()}`
  }

  const marks = [
    { value: 10, label: '10' }, // -> displays mark on slider track
    { value: 20, label: '20' },
    { value: 30, label: '30' },
    { value: 40, label: '40' },
    { value: 50, label: '50' },
    { value: 60, label: '60' },
    { value: 70, label: '70' },
    { value: 80, label: '80' },
    { value: 90, label: '90' },
    { value: 100, label: '100' },
  ];

  function handleSearch(value: string) {
    setSearch(value)
    setDebounceValue(value)
  }

  function searchProjects() {
    if (projectSearchParams) {
      // query 
      if (debounceValue) {
        projectSearchParams.q = debounceValue
      } else {
        projectSearchParams.q = '*'
      }

      // ########### FILTERS ###########

      // Type
      let filterByType = ''
      if (projectTypeSelected && projectTypeSelected !== undefined) {
        filterByType = `projectType:${projectTypeSelected?.toLowerCase()}`
      }

      // Tags
      const hasTagsFilter = hasTags.map((tag) => `tagNames:='${tag}'`).join(' && ')
      const notTagsFilter = notTags.map((tag) => `tagNames:!='${tag}'`).join(' && ')
      let tagsFilter = ''

      if (hasTagsFilter) tagsFilter += `(${hasTagsFilter})`
      if (notTagsFilter) tagsFilter += `(${notTagsFilter})`

      if (hasTagsFilter && notTagsFilter) tagsFilter = `(${hasTagsFilter}) && (${notTagsFilter})`


      // HA Version
      const haVersionFilter = worksWithHAVersion ? `worksWithHAVersion:=${worksWithHAVersion}` : ''

      // IoT Classification
      const iotClassificationFilter = IoTClassification ? `IoTClassification:=${IoTClassification}` : ''

      // HA Install Types
      let haInstallTypesFilter = ''
      if (haInstallTypes.includes(HAInstallType.OS))
        haInstallTypesFilter == '' ? haInstallTypesFilter += `worksWithOS:true` : haInstallTypesFilter += ' && worksWithOS:true'

      if (haInstallTypes.includes(HAInstallType.CONTAINER))
        haInstallTypesFilter == '' ? haInstallTypesFilter += `worksWithContainer:true` : haInstallTypesFilter += ' && worksWithContainer:true'

      if (haInstallTypes.includes(HAInstallType.CORE))
        haInstallTypesFilter == '' ? haInstallTypesFilter += `worksWithCore:true` : haInstallTypesFilter += ' && worksWithCore:true'

      if (haInstallTypes.includes(HAInstallType.SUPERVISED))
        haInstallTypesFilter == '' ? haInstallTypesFilter += `worksWithSupervised:true` : haInstallTypesFilter += ' && worksWithSupervised:true'

      if (haInstallTypes.includes(HAInstallType.ANY))
        haInstallTypesFilter += `worksWithOS:true || worksWithContainer:true || worksWithCore:true || worksWithSupervised:true`

      haInstallTypesFilter = `(${haInstallTypesFilter})`

      // Popularity, Rating, Activity filters
      const popularityFilter = `popularityRating:>=${popularity[0]} && popularityRating:<=${popularity[1]}`
      const ratingFilter = `overallRating:>=${rating[0]} && overallRating:<=${rating[1]}`
      const activityFilter = `activityRating:>=${activity[0]} && activityRating:<=${activity[1]}`
      const p_r_a_string = `${popularityFilter} && ${ratingFilter} && ${activityFilter}`


      // Combine all filters
      let allFilters = filterByType
      allFilters == '' ? allFilters += p_r_a_string : allFilters += ' && ' + p_r_a_string
      tagsFilter ? allFilters == '' ? allFilters += tagsFilter : allFilters += ' && ' + tagsFilter : ''
      haVersionFilter ? allFilters == '' ? allFilters += haVersionFilter : allFilters += ' && ' + haVersionFilter : ''
      iotClassificationFilter ? allFilters == '' ? allFilters += iotClassificationFilter : allFilters += ' && ' + iotClassificationFilter : ''
      allFilters == '' ? allFilters += haInstallTypesFilter : allFilters += ' && ' + haInstallTypesFilter

      console.log("allFilters: ", allFilters)
      // Set the filter by
      projectSearchParams.filter_by = allFilters

      // projectSearchParams.filter_by = 
      const searchProjects = async () => {

        // Set the search query
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
        const retProjects: Project[] = []
        for (const hit of tagSearchResponse.hits) {
          const project: Project = hit.document as unknown as Project
          const highlights = hit.highlights
          if (highlights) {
            for (const highlight of highlights) {

              // Handle multiple snippets (tags)
              if (highlight.field === 'tagNames') {
                /**
                 * This will iterate over the project tags and replace the any tags with a highlight, with the highlight
                 */
                const tempTags:string[] = []
                for (const tag of project.tagNames) {
                  for (const hitTag of highlight.snippets) {
                    if (tag === hitTag.replaceAll(/<mark>/g, '').replaceAll(/<\/mark>/g, '')) {
                      tempTags.push(hitTag)
                    }else{
                      tempTags.push(tag)
                    }
                  }
                }
                project.tagNames = tempTags
              }

              // Handle single snippet
              if(highlight.snippet === undefined) continue
              const replacedSnipped:string = highlight.snippet.replaceAll(/<mark>/g, '').replaceAll(/<\/mark>/g, '')
              if (highlight.field === 'description') {
                project.description = project.description.replace(replacedSnipped, highlight.snippet)
              }
              if (highlight.field === 'title') {
                project.title = project.title.replace(replacedSnipped, highlight.snippet)
              }
            }
          }
          retProjects.push(project)
        }
        setSearchResults(retProjects)
        console.log("tagSearchResponse: ", retProjects)

      }
      
      // add search to url
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      params.set('search', debounceValue);
      url.search = params.toString();
      window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));
      
      searchProjects()
      // hide advanced search
      setShowAdvancedSearch(false)

    }
  }

  function clearFilters() {
    handleProjectTypeSelection(undefined);
    setHasTags([]);
    setNotTags([]);
    setWorksWithHAVersion('');
    setIotClassification(undefined);
    setHaInstallTypes([HAInstallType.ANY]);
    setRating([5, 100]);
    setActivity([5, 100]);
    setPopularity([5, 100]);
  }

  useEffect(() => {
    searchProjects()
  }, [debounceValue]);

  // Update url params when tags change
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // Set the url params for the hasTags
    if (hasTags.length > 0) {
      params.set('hasTags', hasTags.join(','));
    } else {
      params.delete('hasTags');
    }

    // Set the url params for the notTags
    if (notTags.length > 0) {
      params.set('notTags', notTags.join(','));
    } else {
      params.delete('notTags');
    }

    url.search = params.toString();
    window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));

  }, [hasTags, notTags]);


  // Update URL for HAVersion
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (worksWithHAVersion) {
      params.set('haVer', worksWithHAVersion);
    } else {
      params.delete('haVer');
    }

    url.search = params.toString();
    window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));

  }, [worksWithHAVersion]);

  // Update URl for IoTClassification
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (IoTClassification) {
      params.set('iotClass', IoTClassification);
    } else {
      params.delete('iotClass');
    }

    url.search = params.toString();
    window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));

  }, [IoTClassification]);


  // Update URL for Install Types
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (haInstallTypes) {
      params.set('haInsTypes', haInstallTypes.join(','));
    } else {
      params.delete('haInsTypes');
    }

    url.search = params.toString();
    window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));

  }, [haInstallTypes]);
  // Handle Project type selection
  function handleProjectTypeSelection(value: ProjectType|undefined) {

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // Handle 'Any' selection
    if (value === undefined) {
      params.delete('type');
      setProjectTypeSelected(undefined);
      setSearchProps({ limit: '50' })
    } else if (projectTypeSelected !== value) {
      // Set the url params for the project type

      params.set('type', value);
      setProjectTypeSelected(value);
      setSearchProps({ limit: '50', type: value })

    } else if (projectTypeSelected === value) {
      params.delete('type');
      setProjectTypeSelected(undefined);

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

  function handleRating(value: [number, number]) {

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    // Set the url params for the hasTags
    params.set('rMin', value[0].toString());
    params.set('rMax', value[1].toString());

    setRating(value);

    url.search = params.toString();
    window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));
  }

  function handleActivity(value: [number, number]) {

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    // Set the url params for the hasTags
    params.set('aMin', value[0].toString());
    params.set('aMax', value[1].toString());

    setActivity(value);

    url.search = params.toString();
    window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));
  }

  function handlePopularity(value: [number, number]) {

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    // Set the url params for the hasTags
    params.set('pMin', value[0].toString());
    params.set('pMax', value[1].toString());

    setPopularity(value);

    url.search = params.toString();
        window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));
      }


      const HighlightText = ({ text, type }: {text:string, type:string}) => {
        // Split the text by <mark> and </mark> tags
        const parts = text.split(/<mark>|<\/mark>/);

        return (
          <>
          <p>
            {parts.map((part, index) =>
              // Apply styling to every second part (the ones that were inside <mark>)
              index % 2 === 1 ? <span key={part + index} style={{ backgroundColor: 'yellow' }}>{part}</span> : part
            )}
          </p>
          </>
        );
      };
      

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
              leftSectionPointerEvents="all"
              className='z-20 shadow-lg block w-full p-2 ps-10 text-sm text-white rounded-2xl bg-dark focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-200 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              styles={{ input: { paddingLeft: '0px', border: '0px', backgroundColor: 'rgb(38 40 43 / var(--tw-bg-opacity))', color: 'white' } }}
              rightSection={
                <div className='flex -ml-6'>
                <CloseButton
                  className='text-white -ml-5'
                  aria-label="Clear input"
                  onClick={() => handleSearch('')}
                  style={{ display: search ? undefined : 'none' }}
                />
                <div className={search ? 'hidden' : 'px-1'}></div>
                <MagnifyingGlassIcon className={classNames('h-5 w-5 ml-1 my-1 cursor-pointer font-bold', search ? 'text-cyan-400' : 'text-white')} />
                </div>

                }
              leftSection={<AdjustmentsVerticalIcon onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className={'h-5 w-5 cursor-pointer my-1 ml-2 text-white'} />}
            />
            <div className={search || showAdvancedSearch ? 'max-w-lg w-full grid grid-cols-1 z-10 pt-14 rounded-2xl absolute' : 'hidden'}>
              <div className='rounded-2xl bg-white shadow-4xl -mt-10 pt-12 px-4 mx-3 overflow-y-scroll max-h-[90vh] scrollbar'>
                <div className={showAdvancedSearch ? 'px-4 rounded-b-2xl bg-gray-50 pt-4' : 'hidden'}>
                  <div className='grid grid-cols-3 gap-4'>
                    {/* Get Types */}
                    <div className='col-span-3 grid grid-cols-1'>

                      <ProjectTypeHelp />
                      <div className='bg-white'>
                      <ProjectTypeSelectDropdownBox projectType={projectTypeSelected} setProjectType={handleProjectTypeSelection} disabled={false} />
                      </div>
                    </div>

                    {/* </div> */}
                    {/* Popular tags - scroll box  */}
                    <div className='mx-auto col-span-3 '>
                      <div className='text-md mr-2 block text-sm font-medium leading-6 text-gray-900'>Popular {projectTypeSelected !== undefined ? projectTypeSelected : null} Tags</div>
                      <div className='overflow-y-auto h-40 mt-2 scrollbar'>
                        <div className='flex flex-wrap'>
                          {reqStatus === 'success' && tags ?
                            tags.tags.map((tag: TagWithCount) => {
                              return <button key={tag.name} onClick={(e) => { handleSelectedTags(tag.name) }} className={
                                classNames('border border-gray-700 text-gray-800 hover:bg-blue-400 hover:text-white rounded-lg m-0.5 px-2 text-xs font-semibold p-0.5 cursor-pointer ', hasTags.includes(tag.name) ? 'bg-cyan-400' : notTags.includes(tag.name) ? 'bg-red-400' : '')}>{`${tag.name}`}<span className='text-4xs pl-1 font-thin'>{`(${tag.count})`}</span></button>
                            })
                            : tags && tags.tags.map((tag: TagWithCount) => {
                              return <button key={tag.name} className='border border-gray-700 bg-gray-100 text-gray-800 hover:bg-blue-400 hover:text-white rounded-lg m-1 px-2 text-xs font-semibold p-1'><DynamicSkeletonTitle min={1} max={1} maxWidth={75} /></button>
                            })
                          }
                        </div>
                      </div>
                    </div>
                    <div className='col-span-3 mr-2 block text-sm font-medium leading-6 text-gray-900'>
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
                    <div className='col-span-3 mr-2 block text-sm font-medium leading-6 text-gray-900'>
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
                    <div className="col-span-3 grid grid-cols-4">
                      {/* HA Install Types */}
                      <div className="text-black col-span-2 mr-1.5">
                        <HAVersionHelp />
                        <ComboBoxWithHeader items={HACoreVersions.map((version) => ({ text: version.version, altText: version.date }))} headerText={`Note: Select 'Any' if this isnt version dependant.`} value={worksWithHAVersion} setValue={setWorksWithHAVersion} />
                      </div>
                      {/* IoT classification */}
                      <div className="col-span-2 ml-1.5">
                        <IoTClassificationHelp />
                        <StyledComboBox items={getIoTClassificationComboBoxItems()} value={IoTClassification} setValue={setIotClassification} />
                      </div>
                      {/* HA Core Version supported */}
                      <div className="pt-1.5 col-span-4">
                        <HAInstallTypeSelectDropdownBox haInstallTypes={haInstallTypes} setHaInstallTypes={setHaInstallTypes} />

                      </div>

                    </div>
                    <div className='col-span-3 grid grid-cols-10 pt-3 text-center'>
                      <span className='font-semibold'>Rating</span>
                      <RangeSlider minRange={10} min={0} max={100} step={1} defaultValue={[5, 100]} className=' col-span-10 col-start-3' color="cyan"
                        value={rating} onChange={setRating} onChangeEnd={handleRating} marks={marks} />
                    </div>
                    <div className='col-span-3 grid grid-cols-10 pt-3 text-center'>
                      <span className='font-semibold'>Activity</span>
                      <RangeSlider minRange={10} min={0} max={100} step={1} defaultValue={[5, 100]} className=' col-span-10 col-start-3 ' color="cyan"
                        value={activity} onChange={setActivity} onChangeEnd={handleActivity} marks={marks} />
                    </div>
                    <div className='col-span-3 grid grid-cols-10 pt-3 text-center'>
                      <span className='font-semibold'>Popularity</span>
                      <RangeSlider minRange={10} min={0} max={100} step={1} defaultValue={[5, 100]} className=' col-span-10 col-start-3' color="cyan"
                        value={popularity} onChange={setPopularity} onChangeEnd={handlePopularity} marks={marks} />
                    </div>
                  </div>
                  <div className='col-span-3 grid grid-cols-2 pt-5 gap-x-3'>
                    <Button

                      onClick={() => clearFilters()}
                      className={`min-w-full transition duration-200 bg-gray-200 text-gray-800 hover:bg-red-400 hover:text-white rounded-lg py-2 px-4`}
                    >
                      Clear filters
                    </Button>
                    <Button

                      onClick={() => searchProjects()}
                      className={`min-w-full transition duration-200  text-gray-800 bg-cyan-400 hover:text-white rounded-lg py-2 px-4`}
                    >
                      Search
                    </Button>
                  </div>
                </div>
                
                {searchResults.length > 0 ? searchResults.map((project) => (
                  <div key={project.id} className='flex cursor-default select-none rounded-xl p-3 items-center'>
                        <div
                          className={classNames(
                            'flex h-14 w-14 flex-none items-center justify-center rounded-lg',
                          )}
                        >
                          {!project?.backgroundImage ? 
                          <>
                            <img src={project?.backgroundImage && project?.backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL  + '/' + project?.backgroundImage : rngAvatarBackground(project?.id)} alt="" className={classNames("flex h-full w-full items-center justify-center rounded-lg object-cover -mr-28", !project?.backgroundImage ? `blur-[5px]` : "" )} />

                            <img src={project?.backgroundImage && project?.backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL  + '/' + project?.backgroundImage : rngAvatarBackground(project?.id)} alt="" className={classNames("flex h-full w-full items-center justify-center rounded-lg object-cover", !project?.backgroundImage ? `blur-[50px]` : "" )} />
                            <img src={project?.backgroundImage && project?.backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL  + '/' + project?.backgroundImage : rngAvatarBackground(project?.id)} alt="" className={classNames("flex h-full w-full items-center justify-center rounded-lg object-cover", !project?.backgroundImage ? `blur-[50px]` : "" )} />

                          </>
                          :
                          <img src={project?.backgroundImage && project?.backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL  + '/' + project?.backgroundImage : rngAvatarBackground(project?.id)} alt="" className={classNames("flex h-full w-full items-center justify-center rounded-lg object-cover", !project?.backgroundImage ? `blur-[50px]` : "" )} />
                          }

                        </div>
                        <a className="ml-4 flex-auto w-full z-40 overflow-hidden" >
                          <p className={classNames('text-sm font-medium w-full line-clamp-1 overflow-ellipsis', 'text-gray-700')}>
                            <HighlightText text={project.title} type={"title"}/>
                          </p>
                          <p className={classNames('text-sm w-full line-clamp-5 overflow-ellipsis','text-gray-500')}>
                            <HighlightText text={project.description} type={"title"}/>
                          </p>
                          <p className={classNames('text-sm w-full line-clamp-2 relative flex overflow-auto scrollbar','text-gray-500')}>
                            {project.tagNames.map((tag) => (
                              <span key={tag} className='border border-gray-400 text-gray-800 hover:bg-blue-400 hover:text-white rounded-lg m-0.5 px-1.5 text-xs font-semibold p-0.5 cursor-pointer'>
                              <HighlightText text={tag} type={"tags"}/>
                              </span>
                            ))}
                            {/* <HighlightText text={project.tagNames.slice(0, 10).join(', ')} type={"tags"}/> */}
                          </p>
                        </a>
                    </div>
                )) : <div className='text-center'>No results found...</div>}
                    
              </div>
            </div>
          </div >

        </>
      )
    }
