'use client'


import React from 'react';
import { Fragment, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';

interface UserNaviProps {
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
    CodeBracketIcon,
    BeakerIcon,
  
  } from '@heroicons/react/24/outline'
const navigation = [
  { name: 'Store', href: '/', icon: HomeIcon},
  { name: 'Themes', href: '/themes', icon: SwatchIcon},
  { name: 'Integrations', href: '/integrations', icon: SquaresPlusIcon},
  { name: 'Scripts', href: '/scripts', icon: CodeBracketIcon},
  { name: 'Sensors', href: '/sensor', icon: RectangleGroupIcon},
  { name: 'DIYs', href: '/diy', icon: FolderIcon},
  { name: 'Other', href: '/other', icon: BeakerIcon},
  ]

  function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }
  
const UserNavi: React.FC<UserNaviProps> = (props) => {
    const pathname = usePathname();

    // Add your component logic here
    const [selectedNav, setSelectedNav] = useState<string>(navigation.filter((item) =>  pathname?.toUpperCase().includes(item.name.toUpperCase()) ?? '')[0]?.name ?? 'Store')

    return (
      <>
      <div className="flex space-x-4 snap-x overflow--x-scroll overflow-y-hidden scroll-ml-4 scrollbar parent">
      {navigation.map((item) => (
        <a
          id='child'
          key={item.name}
          href={item.href}
          className={classNames(
            selectedNav === item.name
              ? 'border-cyan-500 text-gray-50'
              : 'border-transparent text-gray-50 hover:border-gray-300 hover:text-gray-400',
            `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium first:ml-2 last:mr-10`,
          )}
          aria-current={selectedNav === item.name ? 'page' : undefined}
          onClick={() => setSelectedNav(item.name)}
        >
          {item.name}
        </a>
      ))}
    </div>
    </>
    );
};

export default UserNavi;