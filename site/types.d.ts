import { type SearchOptions } from 'flexsearch'

declare module '@/frontend/markdoc/search.mjs' {
  export type Result = {
    url: string
    title: string
    pageTitle?: string
  }

  export function search(query: string, options?: SearchOptions): Array<Result>
}

declare module 'react-prism' {
  export default function Prism(props: {
    component: string
    className: string
    children: string
  })
}