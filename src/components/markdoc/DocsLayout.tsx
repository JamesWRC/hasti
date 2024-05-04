import { type Node } from '@markdoc/markdoc'

import { DocsHeader } from '@/frontend/components/markdoc/DocsHeader'
import { PrevNextLinks } from '@/frontend/components/markdoc/PrevNextLinks'
import { Prose } from '@/frontend/components/markdoc/Prose'
import { TableOfContents } from '@/frontend/components/markdoc/TableOfContents'
import { collectSections } from '@/frontend/components/markdoc/lib/sections'


// Mantine 

import { useState } from 'react';
import { Group, Box, Collapse, ThemeIcon, Text, UnstyledButton, rem } from '@mantine/core';
import { IconListNumbers, IconChevronUp } from '@tabler/icons-react';
import classes from '@/frontend/app/page.module.css';



interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  initiallyOpened?: boolean;
  tableOfContents?: any;
}

function LinksGroup({ icon: Icon, label, initiallyOpened, tableOfContents }: LinksGroupProps) {
  const [opened, setOpened] = useState(initiallyOpened || false);


  return (
    <>
      <UnstyledButton onClick={() => setOpened((o) => !o)} className={classes.control}>
        <Group justify="space-between" gap={0} pl={-2}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant="light" size={30}>
              <Icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <Box ml="md" mr={"xs"}>{label}</Box>
            {tableOfContents && (
              <IconChevronUp
                className={classes.chevron}
                stroke={1.5}
                style={{
                  width: rem(16),
                  height: rem(16),
                  transform: opened ? 'rotate(180deg)' : 'none',
                }}
              />
            )}
          </Box>

        </Group>
      </UnstyledButton>
      {tableOfContents ? <Collapse in={opened}>
        <TableOfContents tableOfContents={tableOfContents} />
      </Collapse> : null}
    </>
  );
}




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
  const mockdata = {
    label: 'Table of Contents',
    icon: IconListNumbers,
    tableOfContents: tableOfContents,
  };
  return (
    <div className='flex'>
      {/* <Box mih={220} p="md" className='visible md:hidden'>
      <LinksGroup {...mockdata} />

    </Box> */}
      
      {/* // ---------------------------------------------- TABLE OF CONTENTS FOR PAGE */}

      {/* <div className='hidden 2xl:block'>
        <TableOfContents tableOfContents={tableOfContents} />
      </div> */}

      <div className="flex-auto py-16 w-0 max-w-full">
        <article>
          {/* // ---------------------------------------------- TABLE OF CONTENTS FOR PAGE FOR MOBILE */}

          {/* <div className='2xl:hidden '>
            <LinksGroup {...mockdata} />
          </div> */}
          <DocsHeader title={title} />

          <Prose>
            {children}

          </Prose>

        </article>

        {/* <PrevNextLinks /> */}

      </div>
    </div>
  )
}