import { Fragment, use, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Repo } from '@/backend/interfaces/repo'
import { useSession } from 'next-auth/react'
import { UserReposResponse } from '@/backend/interfaces/user/request'
// import Identicon from 'identicon.js';
import { createAvatar } from '@dicebear/core';
import { GetInputProps } from '@mantine/form/lib/types'
import Svg from "react-inlinesvg";

import { identicon } from '@dicebear/collection';
import axios from 'axios';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function SelectRepo({ selectRepo, setSelectRepo, disabled }: { selectRepo: Repo|null, setSelectRepo: any, disabled: boolean}) {
    const [repos, setRepos] = useState<Repo[]>([])
    const { data: session, status } = useSession()

    useEffect(() => {
        const fetchRepos = async () => {
            if(session?.user){

                const res = await axios({
                    url: `${process.env.API_URL}/api/v1/repos/${session?.user.id}`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.user.jwt}`
                    },
                    timeout: 10000,
                    timeoutErrorMessage: 'Request timed out. Please try again.',
                  })

                const data:UserReposResponse = res.data;
                if (data.success) {
                    // orde repos alphabetically
                    data.repos.sort((a, b) => a.fullName.localeCompare(b.fullName))

                    setRepos(data.repos)
                }
            }

        }
        fetchRepos()
    }, [])
    console.log("selectRepo test", selectRepo)
    return (
        <Listbox value={selectRepo} onChange={setSelectRepo} disabled={disabled}>
            {({ open }) => (
                <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Repository</Listbox.Label>
                    {/* <Listbox.Label className="block text-xs font-medium leading-6 text-red-500">{repos.length <= 0 ? 'Update repo permissions. HASTI has no access to any repos.' : null}</Listbox.Label> */}

                    <div className="relative mt-2">
                        <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                            <span className="flex items-center">
                                {selectRepo ? 
                                <Svg src={createAvatar(identicon, {
                                    size: 16,
                                    seed: selectRepo.id,
                                    }).toDataUriSync()} />
                                : <div className='h-5'></div>}
                                <span className="ml-3 block truncate">{
                                selectRepo ? selectRepo.fullName : repos.length <= 0 ? 
                                <a className="block text-xs font-medium leading-6 text-red-300"> HASTI has no access to any repos. Update repo permissions.</a>
                                : 
                                'Select repository...'}</span>
                            </span>
                            <span className={disabled ? "hidden" : "pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"}>
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </Listbox.Button>

                        <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {repos.map((repo) => (
                                    <Listbox.Option
                                        key={repo.id}
                                        className={({ active }) =>
                                            classNames(
                                                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                            )
                                        }
                                        value={repo}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <div className="flex items-center">
                                                    <Svg src={createAvatar(identicon, {
                                                        size: 16,
                                                        seed: repo.id,
                                                        }).toDataUriSync()} />
                                                    <span
                                                        className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                    >
                                                        {repo.fullName}
                                                    </span>
                                                </div>

                                                {selected ? (
                                                    <span
                                                        className={classNames(
                                                            active ? 'text-white' : 'text-indigo-600',
                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                        )}
                                                    >
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </div>
                </>
            )}
        </Listbox>
    )
}
