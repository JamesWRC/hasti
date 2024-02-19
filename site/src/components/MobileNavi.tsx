
'use client'

import React from 'react';
import { Fragment, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation';

interface MobileNaviProps {
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
  const userNavigation = [
    { name: 'Your Profile', href: '#aa' },
    { name: 'Settings', href: '#vv' },
    { name: 'Sign out', href: '#dd' },
  ]
  const user = {
    name: 'Tom Cook',
    email: 'tom@example.com',
    imageUrl:
      'https://avatars.githubusercontent.com/u/38713144?s=40&v=4',
    link: '/a'
  }
  function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }
  
const MobileNavi: React.FC<MobileNaviProps> = (props) => {
    const router = useRouter()

    const handleItemClick = (url: string) => {
      // Navigate to the specified URL
      router.push(url);
    };
  
    // Add your component logic here
    return (
      <div className="grid content-center">

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
      {/* <UserNavi/> */}
    </div>
    );
};

export default MobileNavi;