'use client'

import { ChevronDoubleDownIcon } from '@heroicons/react/24/solid';
// Make a search Bar component

import { Box, Button, Collapse, Group, Text } from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";

export default function Search() {
    const [opened, { toggle }] = useDisclosure(false);

    return (
        <>
        <form className="max-w-md mx-auto pt-3">
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                </div>
                <input type="search" id="default-search" className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-2xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-200 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Integrations, Themes etc..." required />
                {/* <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button> */}
            </div>
        </form>
            <Box className='w-full mr-16'>
            <Group justify="center" mb={5}>
              <Button onClick={toggle} className='text-dark'><ChevronDoubleDownIcon className='text-dark h-4 w-4'/></Button>
            </Group>
      
            <Collapse in={opened}>
              <div className='mx-16'>
                content
              </div>
            </Collapse>
          </Box>
          </>

    )
}