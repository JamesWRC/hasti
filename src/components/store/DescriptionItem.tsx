import AuthorDescription from "./AuthorDescription";
import { DynamicSkeletonText, DynamicSkeletonTitle } from '@/frontend/components/ui/skeleton';
import { rngAvatarBackground } from '@/frontend/components/ui/project';

function classNames(...classes: String[]) {
  return classes.filter(Boolean).join(' ')
}


export default function DescriptionItem({title, description, author, authorImageUrl, authorLink, loaded, backgroundImage, id, animateDelayCount}:{title: string, description: string, author: string, authorImageUrl: string, authorLink: string, loaded: boolean, backgroundImage: string|null, id: string, animateDelayCount: number}) {

  // get current url
  // const projectURl = `/project/${id}`
  const url = new URL(window.location.href)

  let projectTypeString = url.pathname.split('/')[1];
  if (projectTypeString.endsWith('s')) {
    projectTypeString = projectTypeString.substring(0, projectTypeString.length - 1)
  }
    const projectURl = `/${projectTypeString}/${author}/${title}`

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
          {/* <img src="https://www.freepnglogos.com/uploads/512x512-logo/512x512-transparent-instagram-logo-icon-5.png" alt="Theme Icon" className={classNames(loaded ? "h-12 w-12" : "hidden" )}/> */}
          <div
                    className={classNames(
                      'flex h-14 w-14 flex-none items-center justify-center rounded-lg',
                    )}
                  >
                    {!backgroundImage ?
                      <div className='border-dark rounded-lg border flex'>
                        <img src={backgroundImage && backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL + '/' + backgroundImage : rngAvatarBackground(id)} alt="" className={classNames("flex h-14 w-24 items-center justify-center rounded-lg object-cover -mr-28 ", !backgroundImage ? `blur-[5px]` : "")} />

                        <img src={backgroundImage && backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL + '/' + backgroundImage : rngAvatarBackground(id)} alt="" className={classNames("flex h-12 w-12 items-center justify-center rounded-lg object-cover", !backgroundImage ? `blur-[50px]` : "")} />
                        <img src={backgroundImage && backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL + '/' + backgroundImage : rngAvatarBackground(id)} alt="" className={classNames("flex h-12 w-12 items-center justify-center rounded-lg object-cover", !backgroundImage ? `blur-[50px]` : "")} />

                      </div>
                      :
                      <img src={backgroundImage && backgroundImage != "SKELETON" ? process.env.USER_CONTENT_URL + '/' + backgroundImage : rngAvatarBackground(id)} alt="" className={classNames("flex h-max w-max items-center justify-center rounded-lg object-cover", !backgroundImage ? `blur-[50px]` : "")} />
                    }

                  </div>
        
        
        </div>
        <div className="w-max min-h-full">
          <a href={projectURl} className={classNames("text-md xl:text-lg font-bold min-w-full text-black")}>{loaded ? title : <DynamicSkeletonTitle min={3} max={4} maxWidth={100}/>}</a>

          {loaded ? <a href={projectURl} className="mt-1 line-clamp-3 text-xs xl:text-base min-h-fit text-gray-800 max-w-xs 3xl:max-w-2xl">
            {description}
          </a> : < DynamicSkeletonText min={5} max={10}/>}

          <div className={loaded ? "pt-1 -ml-4" : "rounded-xl pt-1 -ml-4 mt-2 w-fit"}>
            <AuthorDescription name={author} imageUrl={authorImageUrl} link={authorLink} loaded={loaded}/>
          </div>

        </div>
      </div>
    )
  }
  