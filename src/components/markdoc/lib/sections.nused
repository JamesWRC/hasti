/* tslint:disable */

import { type Node } from '@markdoc/markdoc'
import { slugifyWithCounter } from '@sindresorhus/slugify'

interface HeadingNode extends Node {
  type: 'heading'
  attributes: {
    level: 1 | 2 | 3 | 4 | 5 | 6
    id?: string
    [key: string]: unknown
  }
}

type H1Node = HeadingNode & {
  attributes: {
    level: 1
  }
}

type H2Node = HeadingNode & {
  attributes: {
    level: 2
  }
}

type H3Node = HeadingNode & {
  attributes: {
    level: 3
  }
}

type SubNode = HeadingNode & {
  attributes: {
    level: 4 | 5 | 6
  }
}


function isHeadingNode(node: Node): node is HeadingNode {
  return (
    node.type === 'heading' &&
    [1, 2, 3, 4, 5, 6].includes(node.attributes.level) &&
    (typeof node.attributes.id === 'string' ||
      typeof node.attributes.id === 'undefined')
  )
}

function isH1Node(node: Node): node is H1Node {
  return isHeadingNode(node) && node.attributes.level === 1
}

function isH2Node(node: Node): node is H2Node {
  return isHeadingNode(node) && node.attributes.level === 2
}

function isH3Node(node: Node): node is H3Node {
  return isHeadingNode(node) && node.attributes.level === 3
}

function getNodeText(node: Node) {
  let text = ''
  for (let child of node.children ?? []) {
    if (child.type === 'text') {
      text += child.attributes.content
    }
    text += getNodeText(child)
  }
  return text
}

export type Subsection = SubNode['attributes'] & {
  id: string
  title: string
  children?: undefined
}

export type H1Section = H1Node['attributes'] &  {
  id: string
  title: string
  children: Array<Subsection>
}

export type H2Section = H2Node['attributes'] &  {
  id: string
  title: string
  children: Array<Subsection>
}

export type H3Section = H3Node['attributes'] &  {
  id: string
  title: string
  children: Array<Subsection>
}


export function collectSections(
  nodes: Array<Node>,
  slugify = slugifyWithCounter(),
) {
  let sections: Array<H2Section | H3Section | Subsection> = []

  for (let node of nodes) {
    if (isH2Node(node) || isH3Node(node)) {
      let title = getNodeText(node)
      if (title) {
        let id = slugify(title)
        if (isH2Node(node)) {
            sections.push({ level:2, id: id, title: title, children: [] })
        }else if(isH3Node(node)){
            sections.push({ level:3, id: id, title: title, children: [] })
        }else{
          if(sections.length === 0) {
            sections.push({ level: 2, id: id, title: title, children: [] })
          } else if(sections && sections[sections.length - 1].children.length === 0){
            sections[sections.length - 1].children.push({
                  ...node.attributes,
                  id,
                  title,
                })
        }
      }
        //   if(sections.length === 0) {
        //     sections.push({ level: node.attributes.level, id: id, title: title, children: [] })
        //   }else{
        //     sections[sections.length - 1].children.push({
        //       ...node.attributes,
        //       id,
        //       title,
        //     })
        //   }
        // } else {
        //   sections.push({ ...node.attributes, id, title, children: [] })
        // }


        /* eslint-disable */

        // sections.push({ ...node.attributes, id, title, children: [] })

      }
    }

    sections.push(...collectSections(node.children ?? [], slugify))
  }

  return sections
}
