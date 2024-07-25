'use client'


import React from 'react';
import { Fragment, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';

interface NavigationProps {
    // Define your component props here
}
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
  import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import MobileNavi from './MobileNavi';
import UserNavi from './UserNavi';

const navigation = [
    { name: 'Store', href: '/', icon: HomeIcon},
    { name: 'Themes', href: '/themes', icon: SwatchIcon},
    { name: 'Integrations', href: '/integrations', icon: SquaresPlusIcon},
    { name: 'adfag', href: '/integrations', icon: SquaresPlusIcon},
    { name: 'vdsv', href: '/integrations', icon: SquaresPlusIcon},
    { name: 'bbb', href: '/integrations', icon: SquaresPlusIcon},
    { name: 'hdshdddsd', href: '/integrations', icon: SquaresPlusIcon},
    { name: 'aaa', href: '/integrations', icon: SquaresPlusIcon},
    
  ]

  function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }
  
const Navigation: React.FC<NavigationProps> = (props) => {
    const pathname = usePathname();

    // Add your component logic here
    const [selectedNav, setSelectedNav] = useState<string>(navigation.filter((item) =>  pathname?.toUpperCase().includes(item.name.toUpperCase()) ?? '')[0]?.name ?? 'Store')

    return (
      <> 
        <div className="min-h-full block md:hidden">
          <Disclosure as="nav" className=" bg-dark">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-16">
                    <div className="flex justify-between w-full ">
                      <div className="flex flex-shrink-0 items-center -ml-3 pr-2">
                        <img
                          className="h-[4rem] w-auto pt-2"
                          src="/white_ha_cube_RIGHT_hasti_splled_out_op4.png"
                          alt="Hasti"
                        />
                      </div>
                      {/* <div className="flex space-x-4 snap-x overflow--x-scroll overflow-y-hidden scroll-ml-4 scrollbar parent">
                        {navigation.map((item) => (
                          <a
                            id='child'
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              selectedNav === item.name
                                ? 'border-cyan-500 text-gray-50'
                                : 'border-transparent text-gray-50 hover:border-gray-300 hover:text-gray-400',
                              `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium first:ml-10 last:mr-10`,
                            )}
                            aria-current={selectedNav === item.name ? 'page' : undefined}
                            onClick={() => setSelectedNav(item.name)}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div> */}
                      <UserNavi/>
                      <MobileNavi/>
                      {/* START Notification Bell Icon */}
                      {/* Allows to view notifications. Add back when notifications are added */}
                      {/* <div className="grid content-center">
                        <button
                          type="button"
                          className="rounded-full bg-dark p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        >
                          <span className="sr-only">View notifications</span>
                          <BellIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                        </div> */}
                      {/* END Notification Bell Icon */}


                        {/* Profile dropdown also used in mobile layout*/}
                        {/* <div className="grid content-center">

                        <Menu as="div" className="relative ml-4">
                          <div>
                            <Menu.Button className="flex max-w-xs items-center rounded-full bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 w-6 h-6" 
                              onSelect={() => handleItemClick('/page1')}>
                              <span className="sr-only">Open user menu</span>
                              <img className="rounded-full" src={user.imageUrl} alt="" />
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
                      </div> */}

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
    </>
    );
};

export default Navigation;