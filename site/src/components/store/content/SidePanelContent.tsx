import cx from 'clsx';
import { useState } from 'react';
import { Table, ScrollArea } from '@mantine/core';
import classes from '@/app/page.module.css';
import { Container, Grid, SimpleGrid, Skeleton, rem } from '@mantine/core';
import { Button } from '@mantine/core';

const data = [
  {
    name: 'Athena Weissnat',
    company: 'Little - Rippin',
    email: 'Elouise.Prohaska@yahoo.com',
  },
  {
    name: 'Deangelo Runolfsson',
    company: 'Greenfelder - Krajcik',
    email: 'Kadin_Trantow87@yahoo.com',
  },
  {
    name: 'Danny Carter',
    company: 'Kohler and Sons',
    email: 'Marina3@hotmail.com',
  },
  {
    name: 'Trace Tremblay PhD',
    company: 'Crona, Aufderhar and Senger',
    email: 'Antonina.Pouros@yahoo.com',
  },
];



function Tags() {
  const tags = [{name: 'Hello', href: 'https://google.com'},
  {name: 'World', href: 'https://google.com'},
  {name: 'Foo', href: 'https://google.com'},
  {name: 'Bar', href: 'https://google.com'},
  {name: 'Baz', href: 'https://google.com'},
  {name: 'Qux', href: 'https://google.com'},
  {name: 'Quux', href: 'https://google.com'},
  {name: 'Max Longer name for a tag', href: 'https://google.com'},
  {name: 'Corge', href: 'https://google.com'},
  {name: 'Grault', href: 'https://google.com'},
  {name: 'Garply', href: 'https://google.com'},
  {name: 'Waldo', href: 'https://google.com'},
  {name: 'Fred', href: 'https://google.com'},
  {name: 'Plugh', href: 'https://google.com'},
  {name: 'Max 25 characters for tag', href: 'https://google.com'},
  {name: 'Xyzzy', href: 'https://google.com'},
  {name: 'Longer name', href: 'https://google.com'},
  {name: 'Thud', href: 'https://google.com'},
  {name: 'Hello', href: 'https://google.com'}]
  // const PRIMARY_COL_HEIGHT = rem(300);
  // const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

  const tagButtons = tags.map((tag) => (
    <Button
      key={tag.name}
      size={'compact-xs'}
      p={3}
      radius={'md'}
      variant="default"
      m={2}>
      {tag.name}
    </Button>
  ));

  return (
    <Container my="md">
      <SimpleGrid cols={{ base: 1 }} spacing="md">
        <Grid gutter="">
          {/* <Grid.Col> */}

            {/* <Skeleton width={'100%'} radius="md" animate={false} /> */}
            {tagButtons}
  
          {/* </Grid.Col> */}
          {/* <Grid.Col span={6}>
            <Skeleton width={'100%'} radius="md" animate={false} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Skeleton width={'100%'} radius="md" animate={false} />
          </Grid.Col> */}
        </Grid>
      </SimpleGrid>
    </Container>
  );

}



export default function SidePaneContent() {
  const [scrolled, setScrolled] = useState(false);

  const rows = data.map((row) => (
    <Table.Tr key={row.name}>
      <Table.Td>{row.name}</Table.Td>
      <Table.Td><Tags/></Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h={{base: '20rem', md: '20rem'}} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={{base: '100%'}}>
        <Table.Thead className={cx(classes.m_table_header, { [classes.m_scrolled]: scrolled })}>
          <Table.Tr>
            {/* <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Company</Table.Th> */}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}