'use client'
import { ArrowLongLeftIcon, ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import DescriptionItem from '@/components/store/DescriptionItem';
const arrayRange = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );


export default function PaginationPanel() {
    const MAX_PAGE_NUMBER = 20;
    const [pageNumber, setPageNumber] = useState<number>(5);
    const [pageContent, setPageContent] = useState<any>([]);

    // use useEffect to make a call to the api/store/themes api and get the total number of pages
    useEffect(() => {
        var tempPageContent = [];

        for (var i = 1; i <= MAX_PAGE_NUMBER; i++) {
            tempPageContent.push(<DescriptionItem />);
        }
        setPageContent(tempPageContent);

        fetch('api/store/themes')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // setPageNumber(data.totalPages);
            })
            .catch(error => console.error(error));
    }, []);

    return <div className="mx-auto max-w-7xl 3xl:max-w-full sm:px-6 lg:px-8">
        {/* ------------- CONTENT  -------------*/}
        <div className="mx-auto grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-12 px-8 md:px-0">
        {pageContent.map((item: any) => {
            return item;
        })}
        
        </div>
        {/* ------------- PAGINATION BAR  -------------*/}
        <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
            <div className="-mt-px flex w-0 flex-1">
                <a
                    href="#"
                    className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                    <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Previous
                </a>
            </div>
            <div className="hidden md:-mt-px md:flex">
                {pageNumber >= 3 ? arrayRange(pageNumber - 3, pageNumber, 1).map((i) => {
                    return (<a
                        key={'paginationPrev#' + i}
                        href="#"
                        className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        {i}
                    </a>)
                }) : null}

                <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">
                    ...
                </span>
                {pageNumber >= 3 ? arrayRange(pageNumber, pageNumber + 3, 1).map((i) => {
                    return (<a
                        key={'paginationPrev#' + i}
                        href="#"
                        className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        {i}
                    </a>)
                }) : null}
            </div>
            <div className="-mt-px flex w-0 flex-1 justify-end">
                <a
                    href="#"
                    className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                    Next
                    <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                </a>
            </div>
        </nav>
    </div>
}
