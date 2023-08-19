'use client'
import { ArrowLongLeftIcon, ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import DescriptionItem from '@/components/store/DescriptionItem';
const arrayRange = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
}



export default function PaginationPanel() {
    const MAX_PAGE_NUMBER = 20;

    const searchParams = useSearchParams()
    const router = useRouter();
    const pathname = usePathname();

    const paramPageNum = searchParams?.get('page')
    let initPageNumber = paramPageNum ? parseInt(paramPageNum) : 1;
    const [pageNumber, setPageNumber] = useState<number>(initPageNumber);
    const [pageContent, setPageContent] = useState<any>([]);

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
        var tempPageContent:any[] = [];

        // for (var i = 1; i <= MAX_PAGE_NUMBER; i++) {
        //     tempPageContent.push(<DescriptionItem title={''} description={''} author={''} authorImageUrl={''} authorLink={''} loaded={false} animateDelayCount={0}/> );
        // }
        // setPageContent(tempPageContent);
        const timer = setTimeout(() => {}, 2000);
        tempPageContent = []
        fetch('api/store/themes')
            .then(response => response.json())
            .then(data => {
                console.log(data.themes);
                for(var i = 0; i < data.themes.length && i <= MAX_PAGE_NUMBER; i++){
                    const delay = 100 * i
                    tempPageContent.push(<DescriptionItem title={data.themes[i].title} description={data.themes[i].description} author={data.themes[i].author.name} authorImageUrl={data.themes[i].author.imageUrl} authorLink={data.themes[i].author.link} loaded={true} animateDelayCount={delay}/>);
                }
                setPageContent(tempPageContent);
                // setPageNumber(data.totalPages);
            })
            .catch(error => console.error(error));
    }, []);

    useEffect(() => {
        console.log(pageNumber)
    },[pageNumber])

    return <div className="mx-auto max-w-7xl 3xl:max-w-full sm:px-6 lg:px-8">
        {/* ------------- CONTENT  -------------*/}
        <div className="mx-auto grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-12 px-8 md:px-0">
        {pageContent.map((item: any) => {
            return item;
        })}
        
        </div>
        {/* ------------- PAGINATION BAR  -------------*/}
        <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 overflow-hidden">
            <div className="-mt-px flex w-0 flex-1 justify-start">
                <a
                    href="#"
                    className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    onClick={(e) => handlePageChange(pageNumber - 1)}
                >
                    <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Previous
                </a>
            </div>
            <div className="hidden md:-mt-px md:flex overflow-x-hidden">
                <div className="grid lg:grid-cols-9 min-w-[150%]">
                {pageNumber < 10 ? arrayRange(1, 10, 1).map((i) => {
                    return (<a
                        key={'paginationPrev#' + i}
                        href="#"
                        className={classNames("inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:text-gray-700", 
                        i == pageNumber ? "inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 border-dark" : "hover:border-gray-300")}
                        onClick={(e) => handlePageChange(i)}
                    >
                        {i}
                    </a>)
                }) : null}

                {pageNumber >= 10 ? arrayRange(pageNumber - 5, pageNumber, 1).map((i) => {
                    return (<a
                        key={'paginationPrev#' + i}
                        href="#"
                        className={classNames("inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:text-gray-700", 
                        i == pageNumber ? "inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 border-dark" : "hover:border-gray-300")}
                        onClick={(e) => handlePageChange(i)}
                        >
                        {i}
                    </a>)
                }) : null}
                
                {/* <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">
                    ...
                </span> */}
                {pageNumber >= 10 ? arrayRange(pageNumber+1, pageNumber + 5, 1).map((i) => {
                    return (<a
                        key={'paginationPrev#' + i}
                        href="#"
                        className={classNames("inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:text-gray-700", 
                        i == pageNumber ? "inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 border-gray-700" : "hover:border-gray-300")}
                        onClick={(e) => handlePageChange(i)}
                        >
                        {i}
                    </a>)
                }) : null}
                </div>
            </div>
            <div className="-mt-px flex w-0 flex-1 justify-end">
                <a
                    href="#"
                    className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    onClick={(e) => handlePageChange(pageNumber + 1)}
                >
                    Next
                    <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                </a>
            </div>
        </nav>
    </div>
}
