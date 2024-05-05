import cx from 'clsx';
import { useState } from 'react';
import { Table, ScrollArea } from '@mantine/core';
import classes from '@/frontend/app/page.module.css';
import { Container, Grid, SimpleGrid, Skeleton, rem } from '@mantine/core';
import { Button } from '@mantine/core';
import { Tag } from '@/backend/interfaces/tag';
import { DynamicSkeletonText } from '@/frontendcomponents/ui/skeleton';

const data = [
  {
    name: 'Tags',
    company: 'Little - Rippin',
    email: 'Elouise.Prohaska@yahoo.com',
  }
];



function Tags({ tags, loaded }: { tags: Tag[], loaded: boolean}) {

  // const PRIMARY_COL_HEIGHT = rem(300);
  // const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

  const tagButtons = tags.map((tag, index) => (
    <Button
      key={`project-tag-${index}`}
      className='text-white bg-gray-800 hover:bg-gray-700'
      size={'compact-xs'}
      p={3}
      radius={'md'}
      variant="default"
      m={2}>
      <a href={`/search?tags=${tag.name}`} className='px-1 pb-1'>
        {loaded ? tag.name : DynamicSkeletonText({max:1, min:1}) }
      </a>
    </Button>
  ));

  return (
    <Container my="md" className='w-fit'>
      <SimpleGrid cols={{ base: 1 }} spacing="md">
        <Grid gutter="">
          {tagButtons}
        </Grid>
      </SimpleGrid>
    </Container>
  );

}



export default function SidePanelTagsContent({ tags, loaded }: { tags: Tag[], loaded: boolean}) {
  const [scrolled, setScrolled] = useState(false);



  return (
    <ScrollArea h={{ base: 'auto' }} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={{ base: '100%' }}>
        <Table.Thead className={cx(classes.m_table_header, { [classes.m_scrolled]: scrolled })}>
        </Table.Thead>
        <Table.Tbody>

          <Table.Tr key="project-tags">
            <Table.Td>
              <div className='text-white'>Tags</div></Table.Td>
            <Table.Td>
              <Tags tags={tags} loaded={loaded} />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}