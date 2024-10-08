'use client'

import { KeyboardEvent, useEffect, useState } from 'react'
import { MultiSelect } from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { useSession } from 'next-auth/react'
import { TagSearchResponse } from '@/backend/interfaces/tag/request'
import { SearchParams } from '@/backend/interfaces/tag';
import { GetInputProps } from '@mantine/form/lib/types';
import axios from 'axios';

export default function SearchComboBox({
    label,
    placeholder,
    searchable,
    maxSelectedValues,
    existingTags,
    nothingFoundMessage, 
    tags, 
    setTags,
    searchParams,
    inputProps}: 
    {label?: string,
        placeholder: string,
        searchable: boolean,
        maxSelectedValues: number,
        nothingFoundMessage: string,
        existingTags: string[], 
        tags: string[], 
        setTags: (tags: string[]) => void,
        searchParams?: SearchParams,
        inputProps?: GetInputProps<any>
    }) {
    // Holds what the user has entered in the search box
    const [search, setSearch] = useState('');
    // Holds the value of the search after a debounce
    const [debounceValue, setDebounceValue] = useDebouncedState('', 750);
    // user auth for JWT
    const { data: session, status } = useSession()

    const [cachedTags, setCachedTags] = useState(existingTags);

    const [message, setMessage] = useState("Start typing to search for tags.");
    // let message = 'searching...'
    
    useEffect(() => {
        setCachedTags(existingTags)
    }, [existingTags]);

    // Function to handle the search input]
    useEffect(() => {
        if (searchParams && debounceValue != '') {
            const searchTags = async () => {
                
                // Set the search query
                searchParams.q = debounceValue
                const params = new URLSearchParams(searchParams as Record<string, any>)

                const res = await axios({
                    url: `${process.env.API_URL}/api/v1/tags/search?` + params,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.user.jwt}`
                    },
                    timeout: 30000,
                    timeoutErrorMessage: 'Request timed out. Please try again.',
                  })

                const tagSearchResponse: TagSearchResponse = res.data;

                const tags = tagSearchResponse.hits.map((hit) => hit.document.name)

                if (res.status === 200) {
                    // Concat and de duplicate the tags
                    setCachedTags(tags.concat(cachedTags).filter((tag, index, self) => self.indexOf(tag) === index))
                    // setExistingTags(tags)
                }
            }
            searchTags()
            setMessage(nothingFoundMessage)

        }
    }, [debounceValue]);

    // Function to handle the search input
    function handleSearch(value: KeyboardEvent<HTMLInputElement>) {
        const delimiterKeys = ['Space', 'Comma', 'Enter']
        const search = value.currentTarget.value.replaceAll(',', '').replaceAll(' ', '')

        if (search.length > 2 && delimiterKeys.includes(value.code)) {
            // console.log('handleTagsChange', value.code);
            // console.log('handleTagsChange', value);
            if (tags.find((tag) => tag === search)) {
                // Clear the search and close the dropdown if the tag already exists in the list
                setDebounceValue('')
                setSearch('')
                return null
            }

            let newTags:string[]
            if (tags === undefined) {
                newTags = [search]
            } else {
                newTags = [...tags, search]
            }
            setTags(newTags)

            // update the cached tags
            setCachedTags(newTags.concat(cachedTags.filter((cachedTag:string) => newTags.indexOf(cachedTag) < 0)))

            // Clear the search
            setDebounceValue('')
            setSearch('')
        } else {
            setDebounceValue(search)
            setMessage('searching...')

        }
    }

    // Function to handle the search results
    function handleSearches(t: string[]) {
        setTags(t)
        return null
    }

    return (
        <MultiSelect
            label={label}
            placeholder={placeholder}
            data={cachedTags}
            searchable={searchable}
            searchValue={search}
            onSearchChange={setSearch}
            value={tags.filter((tag) => tag.length > 0)}
            onChange={handleSearches}
            nothingFoundMessage={message}
            onKeyUp={(e) => { handleSearch(e) }}
            limit={6}
            maxValues={maxSelectedValues}
            error={inputProps ? inputProps('tags').error : null}
        />
    )
}