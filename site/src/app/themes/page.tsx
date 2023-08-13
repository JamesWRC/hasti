'use strict'
'use Client'
import { groupPosts } from "@/interfaces/placeholders";
import AuthorDescription from "@/components/store/AuthorDescription";
import DescriptionItem from "@/components/store/DescriptionItem";
import FeaturedGroup from "@/components/store/FeaturedGroup";
import PaginationPanel from "@/components/store/PaginationPanel";

function renderThemesGrid(){
  return (<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 px-8">
    <DescriptionItem/>
    <DescriptionItem/>
    <DescriptionItem/>
    <DescriptionItem/>
    <DescriptionItem/>
    <DescriptionItem/>
    <DescriptionItem/>
    <DescriptionItem/>
    <DescriptionItem/>
    <DescriptionItem/>
    <DescriptionItem/>
    <DescriptionItem/>
  </div>
  )
}

export default function Page() {
    return (
      <>
        <FeaturedGroup groupTitle={"Popular Themes"} groupPosts={groupPosts} />
      
      {/* {renderThemesGrid()} */}
      <PaginationPanel/>
      <button
        type="button"
        className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
          />
        </svg>
        <span className="mt-2 block text-sm font-semibold text-gray-900">WELCOME</span>
      </button>
      </>
      
    )
  }
  

  