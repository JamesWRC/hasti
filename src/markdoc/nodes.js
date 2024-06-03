import { nodes as defaultNodes, Tag } from '@markdoc/markdoc'
import { slugifyWithCounter } from '@sindresorhus/slugify'
import yaml from 'js-yaml'

import { DocsLayout } from '@/frontend/components/markdoc/DocsLayout'
import { Fence } from '@/frontend/components/markdoc/Fence'

import { ExclamationTriangleIcon, HandRaisedIcon, InformationCircleIcon, LightBulbIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";

let documentSlugifyMap = new Map()

const nodes = {
  document: {
    ...defaultNodes.document,
    render: DocsLayout,
    transform(node, config) {
      documentSlugifyMap.set(config, slugifyWithCounter())

      return new Tag(
        this.render,
        {
          frontmatter: yaml.load(node.attributes.frontmatter),
          nodes: node.children,
        },
        node.transformChildren(config),
      )
    },
  },
  heading: {
    ...defaultNodes.heading,
    transform(node, config) {
      let slugify = documentSlugifyMap.get(config)
      let attributes = node.transformAttributes(config)
      let children = node.transformChildren(config)
      let text = children.filter((child) => typeof child === 'string').join(' ')
      let id = attributes.id ?? slugify(text)

      return new Tag(
        `h${node.attributes.level}`,
        { ...attributes, id },
        children,
      )
    },
  },
  th: {
    ...defaultNodes.th,
    attributes: {
      ...defaultNodes.th.attributes,
      scope: {
        type: String,
        default: 'col',
      },
    },
  },
  item: {
    render: ({ children }) => {
      const checkBoxLabel = children.toString().replace('[x]', '').replace('[ ]', '')
      if(children.toString().startsWith('[x]')) {
        return <>
          <input id={`${children}`} type="checkbox" checked={true}
           className='w-4 h-4 text-dark bg-dark border-gray-300 rounded focus:ring-gray-500 dark:focus:ring-gray-600 dark:border-gray-700 dark:bg-gray-700 dark:checked:bg-gray-600 dark:checked:border-transparent'></input>
          <label for={`${children}`} className='text-sm font-medium text-gray-900 dark:text-gray-300'>{checkBoxLabel}</label>
          <br/>
        </>
      }else if(children.toString().startsWith('[ ]')){
        return <>
        <input id={`${children}`} type="checkbox" checked={false}
           className='w-4 h-4 text-dark bg-dark border-gray-300 rounded focus:ring-gray-500 dark:focus:ring-gray-600 dark:border-gray-700 dark:bg-gray-700 dark:checked:bg-gray-600 dark:checked:border-transparent'></input>
           <label for={`${children}`}>{checkBoxLabel}</label>
        <br/>
        </>
      }else{
        return <li>{children}</li>
      }    
    }
  },
  fence: {
    render: Fence,
    attributes: {
      language: {
        type: String,
      },
    },
  },
  blockquote: {
    render: ({ children }) => {
      // Handle GitHub alert types
      // Get alert type from first child
      let alertType = ''
      let alertTypeChildren = null
      if(children.props && children.props.children && children.props.children.length >=0 && children.props.children[0]) {
        alertType = children.props.children[0]
        alertTypeChildren = children.props.children.slice(1)
      }

      if(alertType.toUpperCase() === '[!NOTE]') {
        return <>
         <div className="bg-blue-50 border-x-4 border-blue-400 pl-4 pb-[0.05rem] pt-4 my-4 rounded-xl">
          {/* Render the note icon next to the type text */}
          <div className="flex items-center -mb-8">
              <InformationCircleIcon className="h-6 w-6 rounded-full text-blue-500 shadow-sm font-bold" aria-hidden="true" />
              <span className="ml-2 block text-sm font-extrabold leading-6 text-blue-500">Note</span>
            </div>

            <p className="text-sm text-black">{alertTypeChildren}</p>
          </div>
        </>
      }else if(alertType.toUpperCase() === '[!TIP]') {
        return <>
        <div className="bg-green-50 border-x-4 border-green-400 pl-4 pb-[0.05rem] pt-4 my-4 rounded-xl">
         {/* Render the note icon next to the type text */}
         <div className="flex items-center -mb-3">
             <LightBulbIcon className="h-6 w-6 rounded-full text-green-500 shadow-sm font-bold" aria-hidden="true" />
             <span className="ml-2 block text-sm font-extrabold leading-6 text-green-500">Tip</span>
           </div>

           <p className="text-sm text-black">{alertTypeChildren}</p>
         </div>
       </>
      }else if(alertType.toUpperCase() === '[!IMPORTANT]') {
        return <>
        <div className="bg-purple-50 border-x-4 border-purple-400 pl-4 pb-[0.05rem] pt-4 my-4 rounded-xl">
          {/* Render the note icon next to the type text */}
          <div className="flex items-center -mb-8">
              <HandRaisedIcon className="h-6 w-6 rounded-full text-purple-500 shadow-sm font-bold" aria-hidden="true" />
              <span className="ml-2 block text-sm font-extrabold leading-6 text-purple-500">Important</span>
            </div>

            <p className="text-sm text-black">{alertTypeChildren}</p>
          </div>
        </>
       }else if(alertType.toUpperCase() === '[!WARNING]') {
        return <>
        <div className="bg-yellow-50 border-x-4 border-yellow-400 pl-4 pb-[0.05rem] pt-4 my-4 rounded-xl">
          {/* Render the note icon next to the type text */}
          <div className="flex items-center -mb-8">
              <ExclamationTriangleIcon className="h-6 w-6 rounded-full text-yellow-500 shadow-sm font-bold" aria-hidden="true" />
              <span className="ml-2 block text-sm font-extrabold leading-6 text-yellow-500">Waring</span>
            </div>

            <p className="text-sm text-black">{alertTypeChildren}</p>
          </div>
        </>
      }else if(alertType.toUpperCase() === '[!CAUTION]') {
        return <>
        <div className="bg-red-50 border-x-4 border-red-400 pl-4 pb-[0.05rem] pt-4 my-4 rounded-xl">
          {/* Render the note icon next to the type text */}
          <div className="flex items-center -mb-4">
              <ShieldExclamationIcon className="h-6 w-6 rounded-full text-red-500 shadow-sm font-bold" aria-hidden="true" />
              <span className="ml-2 block text-sm font-extrabold leading-6 text-red-500">CAUTION!</span>
            </div>

            <p className="text-sm text-black">{alertTypeChildren}</p>
          </div>
        </>
      }else{
        // Render default blockquote
        return <blockquote className={alertType}>{children}</blockquote>
      }    
    }
  },
  code: {
    attributes: {
      content: { type: String },
    },
    render: ({ content, children }) => {
      console.log('children', children)
      const code = content
      console.log('code', code)
      return <div className="inline-code">{code}</div>
    },
  },
  heading: {
    attributes: {
      level: { type: Number },
    },
    render: ({ level, children }) => {
      let href = ''
      console.log('href', children)
      if(children && typeof children === 'object' && children[0]){
        href = `${children[0].toString().replace(/ /g, '_')}`
      }else{
        href = `${children.toString().replace(/ /g, '_')}`
      }
      // Make sure the href doesn't end with an underscore
      while(href.endsWith('_')) {
        href = href.slice(0, -1)
      }

      // Make tags lowercase
      href = href.toLowerCase()
      
      console.log('href2', href)

      return <div className='flex items-center group'>
      <a 
        className="no-underline hover:underline opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-4" 
        aria-label="Permalink: Documentation" 
        href={`#${href}`} 
      >
        <svg className="octicon octicon-link" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
          <path fill-rule="evenodd" d="M7.775 3.275l1.25-1.25a3.5 3.5 0 114.95 4.95l-2.5 2.5a3.5 3.5 0 01-4.95 0 .75.75 0 01.018-1.042.75.75 0 011.042-.018 2 2 0 002.83 0l2.5-2.5a2 2 0 00-2.83-2.83l-1.25 1.25a.75.75 0 01-1.042-.018.75.75 0 01-.018-1.042zM3.085 12.915a2 2 0 002.83 0l1.25-1.25a.75.75 0 011.042.018.75.75 0 01.018 1.042l-1.25 1.25a3.5 3.5 0 11-4.95-4.95l2.5-2.5a3.5 3.5 0 014.95 0 .75.75 0 01-.018 1.042.75.75 0 01-1.042.018 2 2 0 00-2.83 0l-2.5 2.5a2 2 0 000 2.83z"></path>
        </svg>
      </a>
      <h1 
        id={href}
        name={href}
        className={`${level} text-2xl font-bold mt-8 mb-4`}
      >
        {children}
      </h1>
    </div>
    },
  },
}

export default nodes
