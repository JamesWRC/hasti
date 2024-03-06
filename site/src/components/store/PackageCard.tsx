import AuthorDescription from "./AuthorDescription";
import { Project, ProjectType, getProjectLink } from "@/interfaces/project"

function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }
  

export default function PackageCard({project, style}: {project: Project, style: string}) {
    
    
    let className = "col-span-1 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 mb-4 min-w-[10.5rem] sm:max-h-none"
    
    if(style === 'featured') {
        className = classNames(className, "max-h-[15rem]")
    }else{
        className = classNames(className, "max-h-[32rem]")
    }
  return (
    <article
        key={project.id}
        // className="col-span-1 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 mb-4 max-h-[32rem] min-w-[10.5rem] sm:max-h-none"
        className={className}
    
    >
        <img src={project.imageUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40 " />
        <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/0 cursor-pointer" onClick={() => location.href = getProjectLink(project) ?? ''}/>
        <div className='-mx-4 sm:-mx-2'>
          
            <AuthorDescription name={project.author.name} imageUrl={project.author.imageUrl} link={project.author.link} loaded={true}/>
            <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                <a href={getProjectLink(project)}>
                    {/* <span className="absolute inset-0" /> */}
                    <span className="inset-0" />
                    {project.title}
                </a>
            </h3>
            <a className="mt-2 text-base text-gray-300 line-clamp-5 -mb-4" href={getProjectLink(project)}>{project.shortDesc}</a>

        </div>
    </article>
  )
}