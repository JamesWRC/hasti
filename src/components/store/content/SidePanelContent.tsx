import cx from 'clsx';
import { useState } from 'react';
import { Table, ScrollArea } from '@mantine/core';
import classes from '@/frontend/app/page.module.css';
import { Container, Grid, SimpleGrid, Skeleton, rem } from '@mantine/core';
import { Button } from '@mantine/core';
import { Tag } from '@/backend/interfaces/tag';
import { DynamicSkeletonText } from '@/frontend/components/ui/skeleton';
import { useRouter } from 'next/router';

function handleQueryParams(tagName: string, searchParamKey: string) {

  // See if the there are any query params
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);
  if (searchParams && searchParams.has(searchParamKey)) {
    const currentTags = searchParams.get(searchParamKey)?.split(',') || [];
    if (!currentTags.includes(tagName)) {
      currentTags.push(tagName);
      searchParams.set(searchParamKey, currentTags.join(','));
    }else{
      searchParams.set(searchParamKey, tagName);
    }
  }else{
    searchParams.set(searchParamKey, tagName);
  }
  return searchParams.toString().replaceAll(/%2C/g, ',');
}


function Tags({ tags, searchParamKey, tagBaseURL, loaded }: { tags: Tag[], searchParamKey:string, tagBaseURL:string, loaded: boolean}) {

  // const PRIMARY_COL_HEIGHT = rem(300);
  // const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

  const tagButtons = tags.map((tag, index) => (
    <Button
      key={`project-tag-${index}`}
      className='text-white bg-gray-700 hover:bg-gray-600 max-w-[98%]'
      size={'compact-xs'}
      p={3}
      radius={'md'}
      variant="default"
      m={2}
    >
      <a href={`${tagBaseURL}?${handleQueryParams(tag.name, searchParamKey)}`} className='px-1 pb-1 truncate'>
        {loaded ? tag.name : DynamicSkeletonText({max:1, min:1, maxWidth: 10}) }
      </a>
    </Button>
  ));

  return (
    <Container className='w-fit' pr={0}>
      <SimpleGrid cols={{ base: 1 }} spacing="md">
        <Grid gutter="" className='h-28 overflow-y-scroll 4xl:h-full 4xl:overflow-y-auto scrollbar'>
          {tagButtons}
        </Grid>
      </SimpleGrid>
    </Container>
  );

}



export default function SidePanelTagsContent({ tags, loaded, tagBaseURL }: { tags: Tag[], loaded: boolean, tagBaseURL: string}) {
  const [scrolled, setScrolled] = useState(false);



  return (
    <ScrollArea h={{ base: 'auto' }} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={{ base: '100%' }} horizontalSpacing={0} verticalSpacing={0}>
        <Table.Thead className={cx(classes.m_table_header, { [classes.m_scrolled]: scrolled })}>
        </Table.Thead>
        <Table.Tbody>

          <Table.Tr key="project-tags">
            <Table.Td>
              <div className='text-white mx-0'>Tags</div></Table.Td>
            <Table.Td >
                <Tags tags={tags} searchParamKey={'hasTags'} tagBaseURL={tagBaseURL} loaded={loaded} />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}