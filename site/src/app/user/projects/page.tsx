'use client'
import {
    FolderPlusIcon
} from '@heroicons/react/24/outline'
import FeaturedGroup from '@/components/store/FeaturedGroup'
import { groupPosts } from '@/interfaces/placeholders'
import { Session } from 'next-auth'
import PackageCard from '@/components/store/PackageCard'
import { Grid } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';
import SelectRepo from '@/components/repo/SelectRepo';
import { KeyboardEvent, useEffect, useState } from 'react'

import { Repo } from '@/backend/interfaces/repo'



import { useForm } from '@mantine/form';
import { TextInput, Textarea, Group, Box, MultiSelect, useCombobox } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import { useDebouncedState } from '@mantine/hooks';
import { useSession } from 'next-auth/react'
import { TagSearchResponse } from '@/backend/interfaces/tag/request'
import tags from '@/markdoc/tags';

export default function Page() {


    return (
        <div className="bg-white py-24 sm:py-28">
            <div className="mx-auto max-w-[150%] px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl py-4">Your Packages</h2>
                </div>
                <Grid>

                {groupPosts.map((project, index) => (
                    <>
                        {index === 0 ? createNewProject() : null}

                        <Grid.Col span={{ base: 12, md: 4, lg: 4 }} key={`t-${project.id}`}>

                            <PackageCard project={project} style={"featured"}/>
                        </Grid.Col>
                    </>

                    ))}

                {/* <FeaturedGroup groupTitle={"Your Themes"} groupPosts={groupPosts} />
                <FeaturedGroup groupTitle={"Your Integrations"} groupPosts={groupPosts} /> */}
                </Grid>
            </div>
        </div>

    )
}

export function createNewProject() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [opened, { open, close }] = useDisclosure(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selectRepo, setSelectedRepo] = useState<Repo|null>(null)

    // Used to search string value
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [search, setSearch] = useState('');

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [debounceValue, setDebounceValue] = useDebouncedState('', 750);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [tags, setTags] = useState(['']);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [existingTags, setExistingTags] = useState(['']);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: session, status } = useSession()

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const combobox = useCombobox();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm({
        initialValues: {
            projectName: selectRepo?.name,
            email: '',
        },
      });


    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (debounceValue != '') {
            const searchTags = async () => {
                
                const params = new URLSearchParams({
                    q: debounceValue,
                    query_by: 'name',
                    filter_by: 'type:integration',
                    include_fields: 'name,projectsUsing,type',
                    highlight_fields: 'name', // Hacky way to get API to not send highlight fields in response to save response size
                    sort_by: 'projectsUsing:desc',
                    typo_tokens_threshold: '3',
                })

                const res = await fetch(`${process.env.API_URL}/api/tags/search?` + params, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.user.jwt}`
                    }
                })
                const tagSearchResponse:TagSearchResponse = await res.json()
                console.log('tagSearchResponse', tagSearchResponse);
                const tags = tagSearchResponse.hits.map((hit) => hit.document.name)
                
                if (res.ok) {
                    setExistingTags(tags)
                }
            }
            searchTags()
        }
        }, [debounceValue]);


            // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (debounceValue.length === 0) {
            const fetchPopularTags = async () => {
                
                const params = new URLSearchParams({
                    q: '*', // Get most popular tags
                    query_by: 'name',
                    filter_by: 'type:integration',
                    include_fields: 'name,projectsUsing,type',
                    highlight_fields: 'name', // Hacky way to get API to not send highlight fields in response to save response size
                    sort_by: 'projectsUsing:desc',
                    per_page: '10'
                })

                const res = await fetch(`${process.env.API_URL}/api/tags/search?` + params, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.user.jwt}`
                    }
                })
                const tagSearchResponse:TagSearchResponse = await res.json()
                console.log('tagSearchResponse', tagSearchResponse);
                const popularTags = tagSearchResponse.hits.map((hit) => hit.document.name)
                console.log('popularTags', popularTags);

                if (res.ok) {
                    setExistingTags(popularTags)
                }
            }
            fetchPopularTags()
        }
        }, [debounceValue]);

    function handleSearch(value: KeyboardEvent<HTMLInputElement>) {
        const delimiterKeys= ['Space', 'Comma', 'Enter']
        const search = value.currentTarget.value.replaceAll(',', '').replaceAll(' ', '')

        if (search.length > 2 && delimiterKeys.includes(value.code)) {
            // console.log('handleTagsChange', value.code);
            // console.log('handleTagsChange', value);
            console.log('handleTagsChange', search);
            if(tags === undefined) {
                setTags([search])
            } else {
                setTags([...tags, search])

            }
            // Clear the search
            setDebounceValue('')
            setSearch('')
        }else{
            setDebounceValue(search)
        }
        combobox.openDropdown()
    }

    function handleSearches(t: string[]) {
        console.log('handleSearch', t);
        setTags(t)
        return null
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
            console.log('tags', tags);
        }, [tags]);

    return (
        <div key={`create-new-project`} className="mx-auto col-span-1 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 py-8 my-4 min-w-[10.5rem] sm:max-h-none max-h-[15rem]">
            <button
            type="button"
            className="relative block w-full h-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={open}
        >
            <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
            >
            <FolderPlusIcon/>
            </svg>
            <span className="mt-2 block text-sm font-semibold text-gray-900">Create new Project</span>
            </button>

            <Modal 
            size={'xl'}
            opened={opened} 
            onClose={close} 
            title="Authentication"
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
              }}>
            <SelectRepo selectRepo={selectRepo} setSelectRepo={setSelectedRepo}/>
            {/* Form body */}
            <div className="">

            <Group>
            <TextInput className="w-full pt-3" label="projectName" placeholder={selectRepo?.name} defaultValue={selectRepo?.name} {...form.getInputProps('projectName')} />


            <div className='pt-3 w-full'>
            <Textarea
                placeholder="Short description of the project."
                autosize
                minRows={4}
                maxRows={4}
                label="projectShortDesc"
            />

            </div>
            <MultiSelect
                label="Your favorite libraries"
                placeholder="Pick value"
                data={existingTags}
                searchable
                searchValue={search}
                onSearchChange={setSearch}
                value={tags.filter((tag) => tag.length > 0)} 
                onChange={handleSearches}
                nothingFoundMessage="Nothing found... Add to create a new tag"
                onKeyUp={(e) => {handleSearch(e)}}
            />
            </Group>

            </div>

      </Modal>
        </div>
        
          
    )
}