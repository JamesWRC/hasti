import AuthorDescription from "./AuthorDescription";
import { DynamicSkeletonText, DynamicSkeletonTitle } from '@/frontend/components/ui/skeleton';

function classNames(...classes: String[]) {
  return classes.filter(Boolean).join(' ')
}


export default function DescriptionItem({title, description, author, authorImageUrl, authorLink, loaded, animateDelayCount}:{title: string, description: string, author: string, authorImageUrl: string, authorLink: string, loaded: boolean, animateDelayCount: number}) {
    return (
      <div className={classNames('flex px-auto', loaded ? `animate-fade-up animate-once animate-duration-500 p-auto`: 'max-w-xs')}>
        <div className={classNames("mr-4 flex-shrink-0 self-center", loaded ? "" : "bg-gray-200 animate-pulse rounded-2xl")}>
          {/* <svg
            className="h-16 w-16 border border-gray-300 bg-white text-gray-300"
            preserveAspectRatio="none"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <path vectorEffect="non-scaling-stroke" strokeWidth={1} d="M0 0l200 200M0 200L200 0" />
          </svg> */}
          <img src="https://www.freepnglogos.com/uploads/512x512-logo/512x512-transparent-instagram-logo-icon-5.png" alt="Theme Icon" className={classNames(loaded ? "h-12 w-12" : "hidden" )}/>
        </div>
        <div className="w-max min-h-full">
          <h4 className={classNames("text-md xl:text-lg font-bold min-w-full text-black")}>{loaded ? title : <DynamicSkeletonTitle min={3} max={4} maxWidth={100}/>}</h4>

          {loaded ? <p className="mt-1 line-clamp-3 text-xs xl:text-base min-h-fit text-gray-800 max-w-xs 3xl:max-w-2xl">
            {description}
          </p> : < DynamicSkeletonText min={5} max={10}/>}

          <div className={loaded ? "pt-1 -ml-4" : "rounded-xl pt-1 -ml-4 mt-2 w-fit"}>
            <AuthorDescription name={'post.author.name'} imageUrl={'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} link={'/users/'} loaded={loaded}/>
          </div>

        </div>
      </div>
    )
  }
  