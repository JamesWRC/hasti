'use client'
import { ArrowLongLeftIcon, ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Grid } from '@mantine/core';

import DescriptionItem from '@/frontend/components/store/DescriptionItem';

import { useDebouncedState, useMediaQuery } from '@mantine/hooks';
import Pagination from "@/frontend/components/store/Pagination";
import { HAInstallType, IoTClassifications, ProjectType, ProjectWithUser, getIoTClassificationType, getProjectType } from "@/backend/interfaces/project";
import { SearchParams } from "@/backend/interfaces/tag";
import axios from "axios";
import { set } from "lodash";

const arrayRange = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
}


export default function PaginationPanel({projectType}: {projectType: ProjectType}) {
    const MAX_ITEMS_PER_PAGE = 30; // Number of items to show on all other pages that doesnt have a featured section
    const MAX_ITEMS_PER_PAGE_FIRST_PAGE = 20; // Number of items to show for first page


    // The number of pages to display either side of the selected page
    const PAGINATION_PAGE_NUMBERS_EITHER_SIDE = 6
    const searchParams = useSearchParams()

    
    const router = useRouter();
    const pathname = usePathname();

    const paramPageNum = searchParams?.get('page')
    let initPageNumber = paramPageNum ? parseInt(paramPageNum) : 1;

    const [pageNumber, setPageNumber] = useState<number>(initPageNumber);
    const [numItemsDisplayed, setNumItemsDisplayed] = useState<number>(initPageNumber === 1 ? MAX_ITEMS_PER_PAGE_FIRST_PAGE : MAX_ITEMS_PER_PAGE);
    const [pageContent, setPageContent] = useState<any[]>([]);
    const [skeletonPageContent, skeletonSetPageContent] = useState<any[]>([]);
    const [windowSize, setWindowSize] = useState({
        width: -1,
        height: -1,
    });
    const matches = useMediaQuery('(min-width: 768px)');

    const [initParams, setInitParams] = useState(new URLSearchParams(new URL(window.location.href).searchParams))
    const [debounceValue, setDebounceValue] = useState(new URL(window.location.href).searchParams);

    const [searchResults, setSearchResults] = useState<ProjectWithUser[]>([]);
    const [foundResults, setFoundResults] = useState<number>(0);


    const projectSearchParams: SearchParams = {
        q: '*',
        query_by: 'title,description,tagNames',
        include_fields: '*',
        filter_by: "",
        typo_tokens_threshold: 3,
        page: pageNumber,
        per_page: numItemsDisplayed,
    }
    // ****** END search params ****** //

    function searchProjects(currHasTags: string[] = [], currNotTags: string[] = []) {
        if (projectSearchParams) {


            // ****** Make sure the stays up to date with  components/ui/search****** //
            const projectTypeSelected: ProjectType | undefined = initParams.get('type') ? getProjectType(initParams.get('type') as string) : projectType

            // Results has tags
            const hasTags: string[] = initParams.get('hasTags')?.split(',') || [];
            // Must not have tags
            const notTags: string[] = initParams.get('notTags')?.split(',') || [];

            const stringHAInstallTypes: string[] | undefined = initParams.get('haInsTypes')?.split(',')?.filter((type) => Object.values(HAInstallType).includes(type as HAInstallType));
            const haInstallTypes: HAInstallType[] = stringHAInstallTypes ? stringHAInstallTypes.map((type) => type as HAInstallType) || [HAInstallType.ANY] : [HAInstallType.ANY];


            // Home Assistant Install Versions
            const worksWithHAVersion: string = initParams.get('haVer') || '';

            // SetUp IoTClassification combo
            const IoTClassification: IoTClassifications | undefined = initParams.get('iotClass') ? getIoTClassificationType(initParams.get('iotClass') as string) : undefined;

            // sliders
            const rating: [number, number] = [parseInt(initParams.get('rMin') || "10"), parseInt(initParams.get('rMax') || "100")];
            const activity: [number, number] = [parseInt(initParams.get('aMin') || "10"), parseInt(initParams.get('aMax') || "100")];
            const popularity: [number, number] = [parseInt(initParams.get('pMin') || "10"), parseInt(initParams.get('pMax') || "100")];

            // The returned projects that were yielded from the search
            projectSearchParams.q = initParams.get('search') || '*'

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
                console.log("params: ", params)

                const res = await axios({
                    url: `${process.env.API_URL}/api/v1/projects/search?` + params,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                    timeoutErrorMessage: 'Request timed out. Please try again.',
                })

                const tagSearchResponse = res.data;

                setFoundResults(tagSearchResponse.found)
                if (MAX_ITEMS_PER_PAGE * pageNumber > tagSearchResponse.found && pageNumber > 1) {
                    const lastPage = Math.ceil(tagSearchResponse.found / MAX_ITEMS_PER_PAGE)
                    setPageNumber(lastPage)
                    // set the page number in the url
                    const url = new URL(window.location.href);
                    const params = new URLSearchParams(url.search);
                    params.set('page', String(lastPage));
                    url.search = params.toString();
                    window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));
                    return
                }

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
                                    project.description = project.description.replaceAll(/<mark>/g, '').replaceAll(/<\/mark>/g, '')
                                }
                                if (highlight.field === 'title') {
                                    project.title = project.title.replaceAll(/<mark>/g, '').replaceAll(/<\/mark>/g, '')
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
            const url = new URL(window.location.href);
            const params = new URLSearchParams(url.search);

            url.search = params.toString();
            window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));

            requestSearch()

        }
    }

    useEffect(() => {
        searchProjects()
    }, [pageNumber]);

    useEffect(() => {
        if (initParams.get('s') === 't') {
            searchProjects()
            const url = new URL(window.location.href);
            // delete s key and reset url params   
            initParams.delete('s')
            url.search = initParams.toString();
            window.history.pushState({}, '', url.toString().replaceAll(/%2C/g, ','));
        }


    }, [pageNumber, initParams]);

    useEffect(() => {
        function handleURLChange() {
            const url = new URL(window.location.href);
            const params = new URLSearchParams(url.search);
            setInitParams(params)

            //     searchProjects()
            // }
            // Your function here
        }

        // Run the function initially
        handleURLChange();

        // Listen for changes in the URL
        window.addEventListener('urlchange', handleURLChange);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('urlchange', handleURLChange);
        };
    }, []);

    function handlePageChange(pageNumber: number) {
        setPageNumber(pageNumber);
        // now you got a read/write object
        const current = new URLSearchParams(Array.from(searchParams ? searchParams.entries() : [])); // -> has to use this form
        // update as necessary
        current.set("page", String(pageNumber));
        // cast to string
        const search = current.toString();
        // or const query = `${'?'.repeat(search.length && 1)}${search}`;
        const query = search ? `?${search}` : "";

        router.push(`${pathname}${query}`);
    }

    // use useEffect to make a call to the api/store/themes api and get the total number of pages
    useEffect(() => {

        setNumItemsDisplayed(pageNumber <= 1 ? MAX_ITEMS_PER_PAGE_FIRST_PAGE : MAX_ITEMS_PER_PAGE);

    }, [pageNumber]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        function handleResize() {
            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                setWindowSize({ width: window.outerWidth, height: window.outerHeight })
                console.log(window.outerHeight, window.outerWidth)

            }, 500); // delay the update for 500ms after the user stops resizing
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
        // window.addEventListener('resize', ()=> {
        //     setWindowSize({width: window.outerWidth, height: window.innerHeight})
        // })
    }, [])


    useEffect(() => {

        function evenOutRow(numItemInRow: number, currNumItemsDisplayed: number) {
            while (currNumItemsDisplayed % numItemInRow != 0) {
                currNumItemsDisplayed++;
                console.log("currNumItemsDisplayed: ", currNumItemsDisplayed)
            }
            return currNumItemsDisplayed
        }

        console.log("matches", matches)

        var tempPageContent: any[] = [];
        let currNumItemsDisplayed = numItemsDisplayed

        if (windowSize.width > 2000) {
            currNumItemsDisplayed *= 2
            // currNumItemsDisplayed = evenOutRow(6, currNumItemsDisplayed)
            currNumItemsDisplayed = evenOutRow(5, currNumItemsDisplayed)
            // alert(currNumItemsDisplayed)


        } else if (windowSize.width <= 2000 && windowSize.width > 1425) {
            currNumItemsDisplayed *= 1
            currNumItemsDisplayed = evenOutRow(4, currNumItemsDisplayed)

            // Handle devices that have a max row of 2 items
        } else if (windowSize.width <= 1025) {
            currNumItemsDisplayed *= 1
            currNumItemsDisplayed = evenOutRow(2, currNumItemsDisplayed)

        } else {
            currNumItemsDisplayed *= 1
            currNumItemsDisplayed = evenOutRow(3, currNumItemsDisplayed)

        }

        // async function sleep() {
        //     console.log("sleep start");
        //     await new Promise(resolve => setTimeout(resolve, 2000));
        //     console.log("sleep done");
        // }
        // sleep();
        for (var i = 0; i < currNumItemsDisplayed; i++) {
            tempPageContent.push(<DescriptionItem title={''} description={''} author={''} authorImageUrl={''} authorLink={''} loaded={false} backgroundImage={""} id={""} animateDelayCount={0} />);
        }

        setPageContent(tempPageContent);
        tempPageContent = []
        console.log("searchResults: ", searchResults)
        for (var i = 0; i < searchResults.length && i < currNumItemsDisplayed; i++) {
            const delay = 100 * i
            const result: ProjectWithUser = searchResults[i]
            if (result) {
                const authLink = result.user ? `/users/${result.user.username}` : ''
                const authorImg = `https://avatars.githubusercontent.com/u/${result?.user?.githubID}?v=4`
                const backgroundImage = result.backgroundImage
                tempPageContent.push(<DescriptionItem title={result.title} description={result.description} author={result.user?.username} authorImageUrl={authorImg} authorLink={authLink} loaded={true} backgroundImage={backgroundImage} id={result.id} animateDelayCount={delay} />);
            }
        }
        console.log("searchResults tempPageContent: ", tempPageContent)
        setPageContent(tempPageContent);



    }, [numItemsDisplayed, pageNumber, windowSize, searchResults]);


    return (
        <>

            <div className="mx-auto max-w-7xl 3xl:max-w-full sm:px-6 rounded-2xl">
                <div className="flex min-w-0 px-6 md:px-0">
                    <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-900 py-3">
                        <a href="#Themes">{pageNumber !== 1 ? "Themes" : null}</a>
                    </h1>
                </div>
                {/* ------------- CONTENT  -------------*/}
                {/* <div className="mx-auto grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-12 lg:gap-9 px-8 xs:px-8 md:px-0 pb-2 md:pb-14 gap-y-auto">
                    {pageContent.map((item: any) => {
                        return item;
                    })}
                </div> */}
                {/* <Grid grow gutter="sm" className={pageContent.length <=0 ? "block" : "hidden"}>
                    {skeletonPageContent.map((item: any, counter: number) => {
                        return <Grid.Col span={4} key={item.id}>{item}</Grid.Col>
                    })}
                </Grid> */}
                <Pagination pageNumber={pageNumber} handlePageChange={handlePageChange} numShowing={numItemsDisplayed} maxItems={foundResults} />

                <Grid columns={12} grow justify="space-around"
                    gutter={{ base: 5, xs: 'md', md: 'xl', xl: 40 }} className="px-4">
                    {pageContent.map((item: any, counter: number) => {
                        return <Grid.Col span={{ base: 12, md: 6, lg: 6, xl: 3 }} key={item.id}

                            className="flex justify-center w-max my-auto">{item}</Grid.Col>
                    })}
                </Grid>
                {/* ------------- PAGINATION BAR  -------------*/}
            </div>




            <Pagination pageNumber={pageNumber} handlePageChange={handlePageChange} numShowing={numItemsDisplayed} maxItems={foundResults} />
        </>
    )
}
