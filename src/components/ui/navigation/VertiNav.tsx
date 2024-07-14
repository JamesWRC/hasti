'use client'


import React from 'react';
import { Fragment, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';
import { redirect, useSearchParams } from 'next/navigation'

interface VertiNavProps {
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
import { ProjectType, getProjectTypePath } from '@/backend/interfaces/project';
const navigation = [
    { name: 'Store', href: '/', icon: HomeIcon},
    { name: 'Themes', href: `/${getProjectTypePath(ProjectType.THEME)}`, icon: SwatchIcon, projectType: ProjectType.THEME},
    { name: 'Integrations', href: `/${getProjectTypePath(ProjectType.INTEGRATION)}`, icon: SquaresPlusIcon, projectType: ProjectType.INTEGRATION},
    { name: 'Other', href: `/${getProjectTypePath(ProjectType.OTHER)}`, icon: SquaresPlusIcon, projectType: ProjectType.INTEGRATION},
    
  ]

  function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }
  
const VertiNav: React.FC<VertiNavProps> = (props) => {
    const searchParams = useSearchParams()
    const pathname = usePathname();

    // Used to handle the redirect from the OAuth flow for github app
    if(pathname == "/" && searchParams.get('code') && searchParams.get('installation_id') && searchParams.get('setup_action') && searchParams.get('state')){
        redirect(`/user/account?code=${searchParams.get('code')}&installation_id=${searchParams.get('installation_id')}&setup_action=${searchParams.get('setup_action')}&state=${searchParams.get('state')}`)
    }


    // Add your component logic here
    const [selectedNav, setSelectedNav] = useState<string>(navigation.filter((item) =>  pathname?.toUpperCase().includes(item.name.toUpperCase()) ?? '')[0]?.name ?? 'Store')

    return (
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
                        ? 'bg-zinc-50 text-cyan-500'
                        : 'text-gray-100 hover:text-cyan-500 hover:bg-gray-50',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold '
                    )}
                    onClick={() => setSelectedNav(item.name)}
                  >
                    {item.icon ? <item.icon
                      className={classNames(
                        selectedNav === item.name ? 'text-cyan-500' : 'text-white group-hover:text-cyan-500',
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
    );
};

export default VertiNav;