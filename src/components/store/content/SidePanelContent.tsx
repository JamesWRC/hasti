import cx from 'clsx';
import { useState } from 'react';
import { Table, ScrollArea } from '@mantine/core';
import classes from '@/frontend/app/page.module.css';
import { Container, Grid, SimpleGrid, Skeleton, rem } from '@mantine/core';
import { Button } from '@mantine/core';
import { Tag } from '@/backend/interfaces/tag';

const data = [
  {
    name: 'Tags',
    company: 'Little - Rippin',
    email: 'Elouise.Prohaska@yahoo.com',
  }
];



function Tags({ tags }: { tags: Tag[] }) {

  // const PRIMARY_COL_HEIGHT = rem(300);
  // const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

  const tagButtons = tags.map((tag) => (
    <Button
      key={tag.name}
      className='text-white bg-gray-800 hover:bg-gray-700'
      size={'compact-xs'}
      p={3}
      radius={'md'}
      variant="default"
      m={2}>
      <a href={`/search?tags=${tag.name}`} className='px-1 pb-1'>
        {tag.name}
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



export default function SidePanelTagsContent({ tags }: { tags: Tag[] }) {
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
              <Tags tags={tags} />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}