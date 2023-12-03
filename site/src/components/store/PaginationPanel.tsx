'use client'
import { ArrowLongLeftIcon, ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Grid } from '@mantine/core';

import DescriptionItem from '@/components/store/DescriptionItem';
const arrayRange = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
}


type pageContent = {
    content: any[],
    type: string
}



export default function PaginationPanel() {
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

    useEffect(()=> {
        let timeoutId: NodeJS.Timeout;

        function handleResize() {
          clearTimeout(timeoutId);
          
          timeoutId = setTimeout(() => {
            setWindowSize({width: window.outerWidth, height: window.outerHeight})
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

    // use useEffect to make a call to the api/store/themes api and get the total number of pages
    // useEffect(() => {
    //     var tempPageContent:any[] = [];

    //     // for (var i = 1; i <= MAX_PAGE_NUMBER; i++) {
    //     //     tempPageContent.push(<DescriptionItem title={''} description={''} author={''} authorImageUrl={''} authorLink={''} loaded={false} animateDelayCount={0}/> );
    //     // }
    //     // setPageContent(tempPageContent);
    //     tempPageContent = []
    //     fetch('api/store/themes')
    //         .then(response => response.json())
    //         .then(data => {
    //             console.log(data.themes);
    //             for(var i = 0; i < data.themes.length && i < numItemsDisplayed; i++){
    //                 const delay = 100 * i
    //                 tempPageContent.push(<DescriptionItem title={data.themes[i].title} description={data.themes[i].description} author={data.themes[i].author.name} authorImageUrl={data.themes[i].author.imageUrl} authorLink={data.themes[i].author.link} loaded={true} animateDelayCount={delay}/>);
    //             }
    //             setPageContent(tempPageContent);
    //             // setPageNumber(data.totalPages);
    //         })
    //         .catch(error => console.error(error));
    // }, []);
    
    useEffect(() => {

        function evenOutRow(numItemInRow: number, currNumItemsDisplayed: number){
            while (currNumItemsDisplayed % numItemInRow != 0){
                currNumItemsDisplayed++;
                console.log("currNumItemsDisplayed: ", currNumItemsDisplayed)
            }
            return currNumItemsDisplayed
        }
        

        var tempPageContent: any[] = [];
        let currNumItemsDisplayed = numItemsDisplayed

        if(windowSize.width > 2000){
            currNumItemsDisplayed *= 2
            // currNumItemsDisplayed = evenOutRow(6, currNumItemsDisplayed)
            currNumItemsDisplayed = evenOutRow(5, currNumItemsDisplayed)
            // alert(currNumItemsDisplayed)


        }else if(windowSize.width <= 2000 && windowSize.width > 1425){
        currNumItemsDisplayed *= 1
        currNumItemsDisplayed = evenOutRow(4, currNumItemsDisplayed)

        // Handle devices that have a max row of 2 items
        }else if(windowSize.width <= 1025){
            currNumItemsDisplayed *= 1
            currNumItemsDisplayed = evenOutRow(2, currNumItemsDisplayed)

        }else{
            currNumItemsDisplayed *= 1
            currNumItemsDisplayed = evenOutRow(3, currNumItemsDisplayed)

        }

        async function sleep() {
            console.log("sleep start");
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log("sleep done");
          }
        sleep();
        for (var i = 0; i < currNumItemsDisplayed; i++) {
            tempPageContent.push(<DescriptionItem title={''} description={''} author={''} authorImageUrl={''} authorLink={''} loaded={false} animateDelayCount={0} />);
        }

        setPageContent(tempPageContent);
        tempPageContent =[]
        const timer = setTimeout(() => {
            fetch('api/store/themes')
                .then(response => response.json())
                .then(data => {
                    console.log(data.themes);
                    for (var i = 0; i < data.themes.length && i < currNumItemsDisplayed; i++) {
                        const delay = 100 * i
                        tempPageContent.push(<DescriptionItem title={data.themes[i].title} description={data.themes[i].description} author={data.themes[i].author.name} authorImageUrl={data.themes[i].author.imageUrl} authorLink={data.themes[i].author.link} loaded={true} animateDelayCount={delay} />);
                    }

                    setPageContent(tempPageContent);
                    skeletonSetPageContent([]);

                    // setPageNumber(data.totalPages);
                })
                .catch(error => console.error(error));
        });

    }, [numItemsDisplayed, pageNumber, windowSize]);

    useEffect(() => {
        console.log(pageNumber)
    }, [pageNumber])

    return (
        <>
        
            <div className="mx-auto max-w-7xl 3xl:max-w-full sm:px-6 lg:px-8 ">
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

                <Grid columns={12} grow>
                    {pageContent.map((item: any, counter: number) => {
                        return <Grid.Col span={{ base: 12, md: 6, lg: 3, xl:3 }} key={item.id} 
                        className="flex justify-center">{item}</Grid.Col>
                    })}
                </Grid>
                {/* ------------- PAGINATION BAR  -------------*/}
            </div>

            <div className="rounded-2xl lg:absolute lg:bottom-2 lg:left-72 lg:right-4 bg-white px-8 lg:pb-4 mr-2">
                    <nav className="flex items-center justify-between border-t border-gray-200 px-4 md:px-0 overflow-hidden -mx-2">
                        <div className="-mt-px flex w-0 flex-1 justify-start bg-white">
                            <a
                                href="#"
                                className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm lg:text-base font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-inherit bg-white z-10"
                                onClick={(e) => handlePageChange(pageNumber - 1)}
                            >
                                <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                Previous
                            </a>
                        </div>
                        <div className="hidden md:-mt-px xs:flex overflow-x-hidden">
                            <div className="">

                                {arrayRange(pageNumber - PAGINATION_PAGE_NUMBERS_EITHER_SIDE, pageNumber, 1).filter(number => number > 0).map((i) => {
                                    return (<a
                                        key={'paginationPrev#' + i}
                                        href="#"
                                        className={classNames(" lg:first:inline-flex items-center border-t-2 px-3 pt-3.5 text-sm lg:text-base font-medium text-gray-500 hover:text-gray-700",
                                            i == pageNumber ? "border-t-4 border-gray-900 text-gray-800" : "hover:border-gray-600")}
                                        onClick={(e) => handlePageChange(i)}
                                    >
                                        {i}
                                    </a>) 
                                })}

                                {/* // keeping the 5 (in pageNumber < 5 ? 10 ) means the selected number will stay in the center when scrolling to higher numbers */}
                                {arrayRange(pageNumber + 1, pageNumber < PAGINATION_PAGE_NUMBERS_EITHER_SIDE ? 10 : pageNumber + PAGINATION_PAGE_NUMBERS_EITHER_SIDE, 1).map((i) => {
                                    return (<a
                                        key={'paginationPrev#' + i}
                                        href="#"
                                        className={classNames("first:hidden lg:first:inline-flex items-center border-t-2 px-3 pt-3.5 text-sm lg:text-base font-medium text-gray-500 hover:text-gray-700",
                                            i == pageNumber ? "border-t-4 border-gray-900 text-gray-800" : "hover:border-gray-600")}
                                        onClick={(e) => handlePageChange(i)}
                                    >
                                        {i}
                                    </a>)
                                })}
                            </div>
                        </div>
                        <div className="-mt-px flex w-0 flex-1 justify-end">
                            <a
                                href="#"
                                className="inline-flex items-center border-t-2 border-transparent pt-4 text-sm lg:text-base font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-white z-10"
                                onClick={(e) => handlePageChange(pageNumber + 1)}
                            >
                                Next
                                <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                            </a>
                        </div>
                    </nav>
                </div>
        </>
    )
    // <div className="mx-auto max-w-7xl 3xl:max-w-full sm:px-6 lg:px-8">
    //     {/* ------------- CONTENT  -------------*/}
    //     <div className="mx-auto grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-12 lg:gap-9 px-8 xs:px-8 md:px-0">
    //     {pageContent.map((item: any) => {
    //         return item;
    //     })}

    //     </div>
    //     {/* ------------- PAGINATION BAR  -------------*/}
    //     <div className="absolute bottom-0">
    //         <nav className="w-[100rem] flex items-center justify-between border-t border-gray-200 px-4 md:px-0 overflow-hidden -mx-2 mt-1">
    //             <div className="-mt-px flex w-0 flex-1 justify-start bg-white">
    //                 <a
    //                     href="#"
    //                     className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-inherit bg-white z-10"
    //                     onClick={(e) => handlePageChange(pageNumber - 1)}
    //                 >
    //                     <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
    //                     Previous
    //                 </a>
    //             </div>
    //             <div className="hidden md:-mt-px xs:flex overflow-x-hidden">
    //                 <div className="">
    //                 {/* {pageNumber < 10 ? arrayRange(1, 10, 1).map((i) => {
    //                     return (<a
    //                         key={'paginationPrev#' + i}
    //                         href="#"
    //                         className={classNames("first:hidden lg:first:inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:text-gray-700", 
    //                         i == pageNumber ? "inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 border-dark" : "hover:border-gray-300")}
    //                         onClick={(e) => handlePageChange(i)}
    //                     >
    //                         {i}
    //                     </a>)
    //                 }) : null} */}

    //                 {arrayRange(pageNumber - PAGINATION_PAGE_NUMBERS_EITHER_SIDE, pageNumber, 1).filter(number => number > 0).map((i) => {
    //                     return (<a
    //                         key={'paginationPrev#' + i}
    //                         href="#"
    //                         className={classNames("first:hidden lg:first:inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:text-gray-700", 
    //                         i == pageNumber ? "inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 border-dark" : "hover:border-gray-300")}
    //                         onClick={(e) => handlePageChange(i)}
    //                         >
    //                         {i}
    //                     </a>)
    //                 })}

    //                 {/* // keeping the 5 (in pageNumber < 5 ? 10 ) means the selected number will stay in the center when scrolling to higher numbers */}
    //                 {arrayRange(pageNumber+1, pageNumber < PAGINATION_PAGE_NUMBERS_EITHER_SIDE ? 10 : pageNumber + PAGINATION_PAGE_NUMBERS_EITHER_SIDE, 1).map((i) => {
    //                     return (<a
    //                         key={'paginationPrev#' + i}
    //                         href="#"
    //                         className={classNames("last:hidden lg:last:inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:text-gray-700", 
    //                         i == pageNumber ? "inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 border-dark" : "hover:border-gray-300")}
    //                         onClick={(e) => handlePageChange(i)}
    //                         >
    //                         {i}
    //                     </a>)
    //                 })}
    //                 </div>
    //             </div>
    //             <div className="-mt-px flex w-0 flex-1 justify-end bg-white">
    //                 <a
    //                     href="#"
    //                     className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-white z-10"
    //                     onClick={(e) => handlePageChange(pageNumber + 1)}
    //                 >
    //                     Next
    //                     <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
    //                 </a>
    //             </div>
    //         </nav>
    //     </div>
    // </div>
}
