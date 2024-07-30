'use client'

import { IoTClassifications, Project, ProjectType, ProjectWithUser, getAllProjectTypes, getProjectType, getProjectTypePath } from '@/backend/interfaces/project';
import { GetPopularTagsQueryParams, PopularTagResponse, TagSearchResponse, TagWithCount } from '@/backend/interfaces/tag/request';
import { AdjustmentsVerticalIcon, ChevronDoubleDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
// Make a search Bar component

import { Box, Button, CloseButton, Collapse, Group, Input, Radio, RadioGroup, RangeSlider, Text } from '@mantine/core';
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import { useEffect, useState, useRef } from 'react';
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
import { FaceFrownIcon } from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";


export default function Search() {
  const router = useRouter()
  const _url = new URL(window.location.href)
  const initParams = new URLSearchParams(_url.searchParams);
  // *** States for search bar*** //
  //Search
  const [search, setSearch] = useState(initParams.get('search') || '');
  const [debounceValue, setDebounceValue] = useDebouncedState(search, 750);
  // Tags
  const { tags, reqStatus, setSearchProps } = useTags({ limit: '50' });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const searchRef = useRef(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Get the project type from the URL
  let projectTypeString = _url.pathname.split('/')[1];
  if (projectTypeString.endsWith('s')) {
    projectTypeString = projectTypeString.substring(0, projectTypeString.length - 1)
  }
  // ****** Make sure the below search options are the same in /[projectType]/[developer]/[name] projects ****** //
  // *** Params *** //
  const _projectTypeSelected: ProjectType | undefined = getProjectType(initParams.get('type') ? initParams.get('type') as string : projectTypeString) || undefined;

  // Results has tags
  const _hasTags: string[] = initParams.get('hasTags')?.split(',') || [];
  // Must not have tags
  const _notTags: string[] = initParams.get('notTags')?.split(',') || [];

  const _stringHAInstallTypes: string[] | undefined = initParams.get('haInsTypes')?.split(',')?.filter((type) => Object.values(HAInstallType).includes(type as HAInstallType));
  const _haInstallTypes: HAInstallType[] = _stringHAInstallTypes ? _stringHAInstallTypes.map((type) => type as HAInstallType) || [HAInstallType.ANY] : [HAInstallType.ANY];


  // Home Assistant Install Versions
  const _worksWithHAVersion: string = initParams.get('haVer') || '';

  // SetUp IoTClassification combo
  const _IoTClassification: IoTClassifications | undefined = initParams.get('iotClass') ? getIoTClassificationType(initParams.get('iotClass') as string) : undefined;

  // sliders
  const _rating: [number, number] = [parseInt(initParams.get('rMin') || "10"), parseInt(initParams.get('rMax') || "100")];
  const _activity: [number, number] = [parseInt(initParams.get('aMin') || "10"), parseInt(initParams.get('aMax') || "100")];
  const _popularity: [number, number] = [parseInt(initParams.get('pMin') || "10"), parseInt(initParams.get('pMax') || "100")];

  // *** States *** //
  const [projectTypeSelected, setProjectTypeSelected] = useState<ProjectType | undefined>(_projectTypeSelected);
  // Results has tags
  const [hasTags, setHasTags] = useState<string[]>(_hasTags);
  // Must not have tags
  const [notTags, setNotTags] = useState<string[]>(_notTags);
  const [haInstallTypes, setHaInstallTypes] = useState<HAInstallType[]>(_haInstallTypes);
  // Home Assistant Install Versions
  const [worksWithHAVersion, setWorksWithHAVersion] = useState<string>(_worksWithHAVersion);
  // SetUp IoTClassification combo
  const [IoTClassification, setIotClassification] = useState<IoTClassifications | undefined>(_IoTClassification);
  // sliders
  const [rating, setRating] = useState<[number, number]>(_rating);
  const [activity, setActivity] = useState<[number, number]>(_activity);
  const [popularity, setPopularity] = useState<[number, number]>(_popularity);

  // The returned projects that were yielded from the search
  const [searchResults, setSearchResults] = useState<ProjectWithUser[]>([]);


  const projectSearchParams: SearchParams = {
    q: '*',
    query_by: 'title,description,tagNames',
    include_fields: '*',
    filter_by: "",
    typo_tokens_threshold: 3,
  }
  // ****** END search params ****** //

  const tagSearchParams: SearchParams = {
    q: '*',
    query_by: 'name',
    include_fields: 'name,type',
    highlight_fields: 'name', // Hacky way to get API to not send highlight fields in response to save response size
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

  // simple function to set the URL params
  function setURLParams(key: string, value: string, method: string) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (method === 'set') {
      params.set(key, value);
    } else if (method === 'delete') {
      params.delete(key);
    }

    url.search = params.toString();
    window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));

    // Dispatch a custom event
    window.dispatchEvent(new Event('urlchange'));
  }

  function usingAdvancedSearch() {
    let retValue: boolean = false

    if (projectTypeSelected) retValue = true

    if (hasTags.length > 0) retValue = true
    if (notTags.length > 0) retValue = true

    if (worksWithHAVersion) retValue = true
    if (IoTClassification) retValue = true

    if (haInstallTypes.length > 0 && haInstallTypes[0] !== HAInstallType.ANY) retValue = true
    if (rating[0] != 10 || rating[1] != 100) retValue = true

    if (activity[0] != 10 || activity[1] != 100) retValue = true
    if (popularity[0] != 10 || popularity[1] != 100) retValue = true

    return retValue
  }

  function handleSearch(value: string) {
    if (!isSearchActive) setIsSearchActive(true)

    setSearch(value)
    setDebounceValue(value)
  }

  function searchProjects(currHasTags: string[] = [], currNotTags: string[] = []) {
    if (projectSearchParams) {
      // query 
      if (debounceValue) {
        projectSearchParams.q = debounceValue
      } else {
        // projectSearchParams.q = '*'
        return
      }

      // ########### FILTERS ###########

      // Type
      let filterByType = ''
      if (projectTypeSelected && projectTypeSelected !== undefined) {
        filterByType = `projectType:${projectTypeSelected?.toLowerCase()}`
      }

      const searchHasTags = currHasTags.length > 0 ? currHasTags : hasTags
      const searchNotTags = currNotTags.length > 0 ? currNotTags : notTags

      // Tags
      const hasTagsFilter = searchHasTags.map((tag) => `tagNames:='${tag}'`).join(' && ')
      const notTagsFilter = searchNotTags.map((tag) => `tagNames:!='${tag}'`).join(' && ')
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
      const requestSearch = async () => {

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
        const retProjects: ProjectWithUser[] = []
        for (const hit of tagSearchResponse.hits) {
          const project: ProjectWithUser | null = hit.document as unknown as ProjectWithUser | null
          if (project) {

            const highlights = hit.highlights
            if (highlights) {
              for (const highlight of highlights) {

                // Handle multiple snippets (tags)
                if (highlight.field === 'tagNames') {
                  /**
                   * This will iterate over the project tags and replace the any tags with a highlight, with the highlight
                   */
                  const tempTags: string[] = []
                  for (const tag of project.tagNames) {
                    for (const hitTag of highlight.snippets) {
                      if (tag === hitTag.replaceAll(/<mark>/g, '').replaceAll(/<\/mark>/g, '')) {
                        tempTags.push(hitTag)
                      } else {
                        tempTags.push(tag)
                      }
                    }
                  }
                  project.tagNames = tempTags
                }

                // make project.tagNames unique
                project.tagNames = Array.from(new Set(project.tagNames));

                // Handle single snippet
                if (highlight.snippet === undefined) continue;
                const replacedSnipped: string = highlight.snippet.replaceAll(/<mark>/g, '').replaceAll(/<\/mark>/g, '')
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
        }
        setSearchResults(retProjects)
        console.log("tagSearchResponse: ", retProjects)

      }

      // add search to url
      // const url = new URL(window.location.href);
      // const params = new URLSearchParams(url.search);
      // params.set('search', debounceValue);
      // url.search = params.toString();
      // window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));
      setURLParams('search', debounceValue, 'set')
      requestSearch()
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
    // Set the url params for the hasTags
    if (hasTags.length > 0) {
      setURLParams('hasTags', hasTags.join(','), 'set')
    } else {
      setURLParams('hasTags', '', 'delete')
    }

    // Set the url params for the notTags
    if (notTags.length > 0) {
      setURLParams('notTags', notTags.join(','), 'set')
    } else {
      setURLParams('notTags', '', 'delete')
    }

  }, [hasTags, notTags]);


  // Update URL for HAVersion
  useEffect(() => {

    if (worksWithHAVersion) {
      setURLParams('haVer', worksWithHAVersion, 'set')
    } else {
      setURLParams('haVer', '', 'delete')
    }

  }, [worksWithHAVersion]);

  // Update URl for IoTClassification
  useEffect(() => {


    if (IoTClassification) {
      setURLParams('iotClass', IoTClassification, 'set')
    } else {
      setURLParams('iotClass', '', 'delete')
    }

  }, [IoTClassification]);


  // Update URL for Install Types
  useEffect(() => {

    if (haInstallTypes) {
      setURLParams('haInsTypes', haInstallTypes.join(','), 'set')
    } else {
      setURLParams('haInsTypes', '', 'delete')
    }

  }, [haInstallTypes]);
  // Handle Project type selection
  function handleProjectTypeSelection(value: ProjectType | undefined) {

    // Handle 'Any' selection
    if (value === undefined) {
      setURLParams('type', '', 'delete')
      setProjectTypeSelected(undefined);
      setSearchProps({ limit: '50' })
    } else if (projectTypeSelected !== value) {
      // Set the url params for the project type

      setURLParams('type', value, 'set')
      setProjectTypeSelected(value);
      setSearchProps({ limit: '50', type: value })

    } else if (projectTypeSelected === value) {
      setURLParams('type', '', 'delete')
      setProjectTypeSelected(undefined);

    }
  }




  // Handle Tags selection
  function handleSelectedTags(value: string, updateSearch: boolean) {

    // strip any <mark> tags
    value = value.replaceAll(/<mark>/g, '').replaceAll(/<\/mark>/g, '')


    let newHasTags: string[] = []
    let newNotTags: string[] = []
    if (hasTags.includes(value) && !notTags.includes(value)) {
      // Remove the tag from the hasTags array
      newHasTags = hasTags.filter(tag => tag !== value);
      // Add the tag to the notTags array
      newNotTags = [...notTags, value];

    } else if (notTags.includes(value)) {
      newHasTags = hasTags

      // Remove the tag from the notTags array
      newNotTags = notTags.filter(tag => tag !== value);


    } else {
      // Create a new array instead of mutating the existing one
      newHasTags = [...hasTags, value];
      newNotTags = notTags
    }
    setHasTags(newHasTags);
    setNotTags(newNotTags);

    // Set the url params for the hasTags
    if (newHasTags.length > 0) {
      setURLParams('hasTags', newHasTags.join(','), 'set')
    } else {
      setURLParams('hasTags', '', 'delete')
    }

    // Set the url params for the notTags
    if (newNotTags.length > 0) {
      setURLParams('notTags', newNotTags.join(','), 'set')
    } else {
      setURLParams('notTags', '', 'delete')
    }

    if (updateSearch) {
      searchProjects(newHasTags, newNotTags)
    }

  }

  function handleRating(value: [number, number]) {

    // Set the url params for the hasTags
    setURLParams('rMin', value[0].toString(), 'set')
    setURLParams('rMax', value[1].toString(), 'set')
    setRating(value);
  }

  function handleActivity(value: [number, number]) {

    // Set the url params for the hasTags
    setURLParams('aMin', value[0].toString(), 'set')
    setURLParams('aMax', value[1].toString(), 'set')

    setActivity(value);

  }

  function handlePopularity(value: [number, number]) {
    // Set the url params for the hasTags
    setURLParams('pMin', value[0].toString(), 'set')
    setURLParams('pMax', value[1].toString(), 'set')

    setPopularity(value);
  }


  const HighlightText = ({ text, type }: { text: string, type: string }) => {
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


  function stripMarkTags(text: string | undefined) {
    if (!text) return ''
    return text.replaceAll(/<mark>/g, '').replaceAll(/<\/mark>/g, '')
  }

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      // console.log("searchRef: ", searchRef.current)
      // console.log("searchRef: ev.target ", ev.target)

      // if the searchRef exists and the click is outside of the searchRef, hide the advanced search and make sure the Install type isnt being clicked (mantine-MultiSelect-option)
      if ((searchRef.current as unknown as HTMLElement) && !(searchRef.current as unknown as HTMLElement).contains(ev.target as Node) && !(ev.target as HTMLElement).classList.contains('mantine-MultiSelect-option')) {
        setShowAdvancedSearch(false);
        setIsSearchActive(false)

        // if search is open and the search bar is clicked, toggle the search
      } else if ((searchRef.current as unknown as HTMLElement) && (ev.target as HTMLInputElement).name === 'searchBar') {
        setIsSearchActive(prevState => !prevState);
        console.log("searchRef: ev.target name isSearchActive ", isSearchActive)
      } else {
        setIsSearchActive(true)
      }


    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      console.log("searchRef: ev.target name isSearchActive ", isSearchActive)

      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const handleEnterToSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // forces search url param to be search value not debounce
      setURLParams('search', search, 'set')


      setURLParams('s', 't', 'set')
      // hide search
      setShowAdvancedSearch(false);
      setIsSearchActive(false)
    }
  };

  function handleSearchButtonClick() {
    searchProjects();
    setURLParams('s', 't', 'set');
    // hide search
    setShowAdvancedSearch(false);
    setIsSearchActive(false)
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // set the pathname to the project type
    router.push(`/${getProjectTypePath(projectTypeSelected)}` + '?' + params.toString())
  }

  return (
    <>

      <div className='grid grid-cols-1 max-w-lg 2xl:max-w-2xl mx-auto pt-4 sticky top-0 z-30 pl-2 pr-1 -mt-24' ref={searchRef}>
        <Input
          placeholder="Search Integrations, Themes etc..."
          name='searchBar'
          value={search}
          onChange={(event) => handleSearch(event.currentTarget.value)}
          // onFocus={() => setShowAdvancedSearch(true)}
          onKeyDown={handleEnterToSearch}
          rightSectionPointerEvents="all"
          leftSectionPointerEvents="all"
          className='z-20 shadow-lg block w-full p-2 ps-10 text-[16px] text-white rounded-2xl bg-dark focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-200 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
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
          leftSection={<AdjustmentsVerticalIcon onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className={classNames('h-5 w-5 cursor-pointer my-1 ml-2', usingAdvancedSearch() ? 'text-cyan-400' : 'text-white')} />}
        />
        <div className={search || showAdvancedSearch ? 'max-w-lg 2xl:max-w-2xl w-full grid grid-cols-1 z-10 pt-14 rounded-2xl absolute' : 'hidden'}>
          <div className='rounded-2xl bg-white shadow-4xl -mt-10 pt-12 px-4 mx-3 overflow-y-scroll max-h-[80vh] lg:max-h-[90vh] scrollbar overscroll-contain'>
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
                          return <button key={tag.name} onClick={(e) => { handleSelectedTags(tag.name, false) }} className={
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
              <div className='col-span-2 grid grid-cols-2 pt-5 gap-x-3 pb-4'>
                <Button

                  onClick={() => clearFilters()}
                  className={`col-span-1 transition duration-200 bg-gray-200 text-gray-800 hover:bg-red-400 hover:text-white rounded-lg py-2 px-4`}
                >
                  Clear filters
                </Button>
                <Button

                  onClick={() => handleSearchButtonClick()}
                  className={`col-span-1 transition duration-200  text-gray-800 bg-cyan-400 hover:text-white rounded-lg py-2 px-4`}
                >
                  Search
                </Button>
              </div>
            </div>
            <div className={classNames(!showAdvancedSearch && isSearchActive && usingAdvancedSearch() ? 'flex center py-4' : 'hidden')}>
              <span className='font-bold text-center text-gray-500 text-sm'>Results filtered. Using&nbsp;</span>
              <span onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className='font-bold text-center text-gray-500 text-sm underline hover:text-cyan-500 cursor-pointer'>advanced search</span>
              <MagnifyingGlassIcon className={classNames('text-dark h-4 w-4 text-center mt-0.5')} />
            </div>
            <div className=''>
              {!showAdvancedSearch && isSearchActive ? searchResults.length > 0 ? searchResults.map((project) => (
                <a key={project?.id} className='flex select-none rounded-xl p-3 pr-0 items-center hover:bg-gray-200 first:mt-3 last:mb-3'>
                  <div
                    className={classNames(
                      'flex h-14 w-14 flex-none items-center justify-center rounded-lg',
                    )}
                  >
                    {!project?.backgroundImage ?
                      <div className='border-dark rounded-lg border flex'>
                        <img src={project?.backgroundImage && project?.backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL + '/' + project?.backgroundImage : rngAvatarBackground(project?.id)} alt="" className={classNames("flex h-14 w-24 items-center justify-center rounded-lg object-cover -mr-28 ", !project?.backgroundImage ? `blur-[5px]` : "")} />

                        <img src={project?.backgroundImage && project?.backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL + '/' + project?.backgroundImage : rngAvatarBackground(project?.id)} alt="" className={classNames("flex h-8 w-8 items-center justify-center rounded-lg object-cover", !project?.backgroundImage ? `blur-[75px]` : "")} />
                        <img src={project?.backgroundImage && project?.backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL + '/' + project?.backgroundImage : rngAvatarBackground(project?.id)} alt="" className={classNames("flex h-12 w-12 items-center justify-center rounded-lg object-cover", !project?.backgroundImage ? `blur-[75px]` : "")} />

                      </div>
                      :
                      <img src={project?.backgroundImage && project?.backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL + '/' + project?.backgroundImage : rngAvatarBackground(project?.id)} alt="" className={classNames("flex h-max w-max items-center justify-center rounded-lg object-cover", !project?.backgroundImage ? `blur-[75px]` : "")} />
                    }

                  </div>
                  <a className="ml-4 flex-auto w-full z-40 overflow-hidden py-1" >
                    <a className={classNames(project && project.title.length > 30 ? 'text-xs font-bold' : 'text-lg font-medium', ' w-full line-clamp-1 overflow-ellipsis text-gray-700 cursor-pointer')}
                      href={`${getProjectTypePath(getProjectType(project?.projectType as string))}/${project?.user.username}/${stripMarkTags(project?.title)}`}>
                      <HighlightText text={project ? project.title : ""} type={"title"} />
                    </a>
                    <a className={classNames('text-sm w-full line-clamp-5 overflow-ellipsis', 'text-gray-500')}
                      href={`${getProjectTypePath(getProjectType(project?.projectType as string))}/${project?.user.username}/${stripMarkTags(project?.title)}`}>
                      <HighlightText text={project ? project.description : ""} type={"title"} />
                    </a>
                    <p className={classNames('text-sm w-full line-clamp-2 relative flex overflow-auto scrollbar pt-2', 'text-gray-500')}>
                      {project?.tagNames.map((tag:string) => (
                        <span key={tag}
                          onClick={(e) => {
                            handleSelectedTags(tag, true);
                          }}
                          className={classNames('border border-gray-400 text-gray-800 hover:bg-blue-400 hover:text-white rounded-lg m-0.5 px-1.5 text-xs font-semibold p-0.5 cursor-pointer', hasTags.includes(tag) ? 'bg-cyan-400' : notTags.includes(tag) ? 'bg-red-400' : '')}>

                          <HighlightText text={tag} type={"tags"} />
                        </span>
                      ))}
                      {/* <HighlightText text={project.tagNames.slice(0, 10).join(', ')} type={"tags"}/> */}

                    </p>

                  </a>

                </a>
              )) : <div className='text-center py-5 flex place-content-center'>
                {/* Search icon */}
                {/* <FaceFrownIcon className='h-8 w-8 text-gray-500 mx-2' /> */}
                <p className='text-gray-500 text-lg py-0.5'>No results found...</p>
              </div> : null}
            </div>
          </div>
        </div>
      </div >

    </>
  )
}
