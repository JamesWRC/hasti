import { nodes as defaultNodes, Tag } from '@markdoc/markdoc'
import { slugifyWithCounter } from '@sindresorhus/slugify'
import yaml from 'js-yaml'

import { DocsLayout } from '@/frontend/components/markdoc/DocsLayout'
import { Fence } from '@/frontend/components/markdoc/Fence'

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
    parse: (node, context) => {
      let listType = 'default'
      if(node.startsWith('- [x]')){
        listType = 'checked'
      }else if(node.startsWith('- [ ]')){
        listType = node
      }
      return new Markdoc.Tag(this.render, {}, []);

    },
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
}

export default nodes
