
"use client"

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'
import {
  FolderIcon,
  UsersIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react';


const UserNavigation: React.FC = () => {
    const pathname = usePathname()
    const { data: session, status } = useSession()

    // repo count state
    const [repoCount, setRepoCount] = useState(0)
    const [notificationCount, setNotificationCount] = useState(0)

    const navigation = [
        { name: 'Account', href: '/user/account', icon: UsersIcon, current: pathname === '/user/account' },
        { name: 'Projects', href: '/user/projects', icon: FolderIcon, count: repoCount, current: pathname === '/user/projects' },
        { name: 'Notifications', href: '/user/notifications', icon: BellIcon, count: notificationCount, current: pathname === '/user/notifications' },
      ]
      function classNames(...classes: string[]) {
        return classes.filter(Boolean).join(' ')
      }

      useEffect(() => {
        const fetchRepoCount = async () => {
          const res = await fetch(`${process.env.API_URL}/api/user/projectCount`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user.jwt}`
            }
          })
          const data = await res.json()
          if (data.success) {
            setRepoCount(data.count)
          }
        }
        const fetchNotificationCount = async () => {
          const res = await fetch(`${process.env.API_URL}/api/user/notificationCount`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user.jwt}`
            }
          })
          const data = await res.json()
          console.log("data", data)
          if (data.success) {
            setNotificationCount(data.count)
          }
        }
        
        fetchRepoCount()
        fetchNotificationCount()

      }, [])

    return (
        <>
        {navigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className={classNames(
                  item.current
                    ? 'bg-gray-50 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                )}
              >
                <item.icon
                  className={classNames(
                    item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                    'h-6 w-6 shrink-0'
                  )}
                  aria-hidden="true"
                />
                {item.name}
                {item.count || item.count === 0 ? (
                  <span
                    className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-1.5 py-0.5 text-center text-xs font-medium leading-5 text-gray-600 ring-1 ring-inset ring-gray-200"
                    aria-hidden="true"
                  >
                    {item.count}
                  </span>
                ) : null}
              </a>
            </li>
          ))}
          </>
    );
};

export default UserNavigation;