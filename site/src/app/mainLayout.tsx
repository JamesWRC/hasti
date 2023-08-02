'use strict'
'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  RectangleGroupIcon,
  SquaresPlusIcon,
  SwatchIcon,

} from '@heroicons/react/24/outline'
import Footer from '@/components/Footer'



const navigation = [
  { name: 'Store', href: '/store', icon: HomeIcon, current: true },
  { name: 'Themes', href: '/themes', icon: SwatchIcon, current: false },
  { name: 'Integrations', href: '/integrations', icon: SquaresPlusIcon, current: false },
  
]
const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

function classNames(...classes: String[]) {
  return classes.filter(Boolean).join(' ')
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [selectedNav, setSelectedNav] = useState<string>(navigation[0].name)



  return (
    <>
      <div className=' overflow-hidden scrollbar'>


        {/*
  This example requires updating your template:

  ```
  <html class="h-full bg-dark">
  <body class="h-full">
  ```
*/}


        {/* Static sidebar for desktop */}
        <div className="md:fixed md:inset-y-0 md:z-50 md:flex md:w-72 md:flex-col hidden">

          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex flex-col gap-y-5 overflow-y-auto bg-dark px-6">
            <div className="grid grid-cols-1 gap-4 place-content-between h-screen">
              <div>

                <div className="my-10 -ml-4 flex h-16 shrink-0 items-center">
                  <img
                    className="h-28 w-auto"
                    src="/white_ha_cube_RIGHT_hasti_splled_out_op4.png"
                    alt="Your Company"
                  />
                  <div className="mt-4 max-w-[36rem] text-5xl font-extrabold tracking-tight text-white xl:max-w-[43.5rem]">
                    HASTI
                  </div>

                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={classNames(
                                selectedNav === item.name
                                  ? 'bg-zinc-50 text-indigo-600'
                                  : 'text-gray-100 hover:text-indigo-600 hover:bg-gray-50',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold '
                              )}
                              onClick={() => setSelectedNav(item.name)}
                            >
                              {item.icon ? <item.icon
                                className={classNames(
                                  selectedNav === item.name ? 'text-indigo-600' : 'text-white group-hover:text-indigo-600',
                                  'h-6 w-6 shrink-0'
                                )}
                                aria-hidden="true"
                              /> : null}
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="-mx-6 mt-auto pb-2 w-full rounded-2xl order-last flex-auto">
                <div className='px-6 py-3 '>
                  <div className="text-xs font-semibold leading-6 text-gray-400">Your teams</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {teams.map((team) => (
                      <li key={team.name}>
                        <a
                          href={team.href}
                          className={classNames(
                            team.current
                              ? 'bg-gray-50 text-indigo-600'
                              : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <span
                            className={classNames(
                              team.current
                                ? 'text-indigo-600 border-indigo-600'
                                : 'text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600',
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-dark'
                            )}
                          >
                            {team.initial}
                          </span>
                          <span className="truncate">{team.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#"
                  className="rounded-md flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-100 hover:bg-gray-50"
                >
                  <img
                    className="h-8 w-8 rounded-full bg-gray-50"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">Tom Cook</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* ---========== MOBILE NAV BAR ==========--- */}
        <div className="min-h-full block md:hidden">
          <Disclosure as="nav" className=" bg-dark">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-16">
                    <div className="flex justify-between w-full ">
                      <div className="flex flex-shrink-0 items-center -ml-3 ">
                        <img
                          className="h-[4rem] w-auto pt-2"
                          src="/white_ha_cube_RIGHT_hasti_splled_out_op4.png"
                          alt="Your Company"
                        />
                      </div>
                      <div className="flex space-x-4 snap-x overflow--x-scroll overflow-y-hidden scroll-ml-4 scrollbar parent">
                        {navigation.map((item) => (
                          <a
                            id='child'
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'border-indigo-500 text-gray-50'
                                : 'border-transparent text-gray-50 hover:border-gray-300 hover:text-gray-400',
                              `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium first:ml-10 last:mr-10`,
                            )}
                            aria-current={item.current ? 'page' : undefined}
                            onClick={() => setSelectedNav(item.name)}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                      <div className="flex items-center">
                        <div
                          className="h-8 w-6 mx-6"
                        />
                      </div>
                      <div className="ml-6 flex items-center pr-2 absolute right-0 top-4">
                        <button
                          type="button"
                          className="rounded-full bg-dark p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <span className="sr-only">View notifications</span>
                          <BellIcon className="h-6 w-6" aria-hidden="true" />
                        </button>

                        {/* Profile dropdown also used in mobile layout*/}
                        <Menu as="div" className="relative ml-3">
                          <div>
                            <Menu.Button className="flex max-w-xs items-center rounded-full bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                              <span className="sr-only">Open user menu</span>
                              <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" />
                            </Menu.Button>
                          </div>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-dark py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {userNavigation.map((item) => (
                                <Menu.Item key={item.name}>
                                  {({ active }) => (
                                    <a
                                      href={item.href}
                                      className={classNames(
                                        active ? 'bg-gray-100' : '',
                                        'block px-4 py-2 text-sm text-gray-700'
                                      )}
                                    >
                                      {item.name}
                                    </a>
                                  )}
                                </Menu.Item>
                              ))}
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}
          </Disclosure>

          {/* <div className="py-10 rounded">
    <header>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dashboard</h1>
      </div>
    </header>
    <main className='p-3'>
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 bg-red-500 rounded-lg">{children}</div>
    </main>
  </div> */}
        </div>



        <main className="md:pl-72 bg-dark h-full md:h-screen p-2">
          <div className="p-3 bg-white rounded-2xl w-full h-full md:h-full overflow-y-scroll scrollbar">
            {children}

          </div>
        </main>

      </div>
      <Footer />

    </>


  )
}
