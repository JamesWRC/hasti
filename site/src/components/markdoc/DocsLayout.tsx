import { type Node } from '@markdoc/markdoc'

import { DocsHeader } from '@/components/markdoc/DocsHeader'
import { PrevNextLinks } from '@/components/markdoc/PrevNextLinks'
import { Prose } from '@/components/markdoc/Prose'
import { TableOfContents } from '@/components/markdoc/TableOfContents'
import { collectSections } from '@/components/markdoc/lib/sections'

export function DocsLayout({
  children,
  frontmatter: { title },
  nodes,
}: {
  children: React.ReactNode
  frontmatter: { title?: string }
  nodes: Array<Node>
}) {
  let tableOfContents = collectSections(nodes)

  return (
    <>
      <div className="min-w-0 max-w-2xl flex-auto py-16 lg:max-w-none lg:pl-8 lg:pr-0 px-4 2xl:px-16">
        <article>
          
          <DocsHeader title={title} />
          <Prose>{children}
          
          </Prose>
        </article>
        <PrevNextLinks />
      </div>
      <TableOfContents tableOfContents={tableOfContents} />
    </>
  )
}
