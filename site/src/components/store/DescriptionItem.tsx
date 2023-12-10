import AuthorDescription from "./AuthorDescription";

function classNames(...classes: String[]) {
  return classes.filter(Boolean).join(' ')
}

function generateSkeletonLines(){
  // generate 2 to 3 lines of text
  const lines = Math.floor(Math.random() * 2) + 2;
  const widths = [ 20, 24, 28, 32, 36, 999];
  const lineArray = [];
  let widthArray = []
  for(let i = 0; i < lines; i++){
    const randomWidths = Math.floor(Math.random() * widths.length);
    widthArray.push(widths[randomWidths])
  }
  widthArray.sort((a, b) => (a > b) ? 1 : -1);
  // widthArray.reverse();
  for(let i = 0; i < lines; i++){
    lineArray.push(<p className={`bg-gray-200 animate-pulse rounded-xl h-4 my-1 mt-1 w-${widthArray[i] == 999 ? "full" : widthArray[i]}`}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>)
  }
  return (lineArray)
}

export default function DescriptionItem({title, description, author, authorImageUrl, authorLink, loaded, animateDelayCount}:{title: string, description: string, author: string, authorImageUrl: string, authorLink: string, loaded: boolean, animateDelayCount: number}) {
    return (
      <div className={classNames('flex px-auto', loaded ? `animate-fade-up animate-once animate-duration-500 p-auto`: '')}>
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
          <img src="https://www.freepnglogos.com/uploads/512x512-logo/512x512-transparent-instagram-logo-icon-5.png" alt="Theme Icon" className="h-12 w-12" />
        </div>
        <div className="w-max min-h-full">
          <h4 className={classNames("text-md xl:text-lg font-bold min-w-full text-black", loaded ? "" : "bg-gray-200 animate-pulse rounded-2xl")}>{loaded ? title : <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>}</h4>

          {loaded ? <p className="mt-1 line-clamp-3 text-xs xl:text-base min-h-fit text-gray-800 w-[21rem]">
            {description}
          </p> : generateSkeletonLines()}

          <div className={loaded ? "pt-1 -ml-4" : "bg-gray-200 animate-pulse rounded-xl pt-1 -ml-4 mt-2"}>
            <AuthorDescription name={'post.author.name'} imageUrl={'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} link={'www.github.com'} loaded={loaded}/>
          </div>

        </div>
      </div>
    )
  }
  