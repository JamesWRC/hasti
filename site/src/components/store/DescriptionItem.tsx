import AuthorDescription from "./AuthorDescription";

export default function DescriptionItem() {
    return (
      <div className="flex">
        <div className="mr-4 flex-shrink-0 self-center">
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
          <img src="https://www.freepnglogos.com/uploads/512x512-logo/512x512-transparent-instagram-logo-icon-5.png" alt="Theme Icon" className="h-16 w-16 " />
        </div>
        <div>
          <h4 className="text-lg font-bold">Lorem ipsum</h4>
          <p className="mt-1 line-clamp-3">
            Repudiandae sint consequuntur vel. Amet ut nobis explicabo numquam expedita quia omnis voluptatem. Minus
            quidem ipsam quia iusto.
          </p>
          <div className="pt-1">
            <AuthorDescription name={'post.author.name'} imageUrl={'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} link={'www.github.com'} />
          </div>

        </div>
      </div>
    )
  }
  