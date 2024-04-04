import { Fragment, use, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Repo } from '@/backend/interfaces/repo'
import { useSession } from 'next-auth/react'
import { UserReposResponse } from '@/backend/interfaces/user/requests'
import Identicon from 'identicon.js';
import { GetInputProps } from '@mantine/form/lib/types'


function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function SelectRepo({ selectRepo, setSelectRepo }: { selectRepo: Repo|null, setSelectRepo: any }) {
    const [repos, setRepos] = useState<Repo[]>([])
    const { data: session, status } = useSession()

    useEffect(() => {
        const fetchRepos = async () => {
            const res = await fetch(`${process.env.API_URL}/api/user/repos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user.jwt}`
                }
            })
            const data:UserReposResponse = await res.json()
            if (data.success) {
                setRepos(data.repos)
            }
        }
        fetchRepos()
    }, [])

    return (
        <Listbox value={selectRepo} onChange={setSelectRepo}>
            {({ open }) => (
                <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Repository</Listbox.Label>
                    <Listbox.Label className="block text-xs font-medium leading-6 text-red-500">{repos.length <= 0 ? 'Update repo permissions. HASTI has no access to any repos.' : null}</Listbox.Label>

                    <div className="relative mt-2">
                        <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                            <span className="flex items-center">
                                {selectRepo !== null ? 
                                <img src={"data:image/png;base64," + new Identicon(selectRepo.id, 420).toString()} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />
                                : <div className='h-5'></div>}
                                <span className="ml-3 block truncate">{selectRepo !== null ? selectRepo.fullName : 'Select repository...'}</span>
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
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
                                                    <img src={"data:image/png;base64," +  new Identicon(repo.id, 420).toString()} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />
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
