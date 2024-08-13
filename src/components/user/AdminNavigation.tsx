
"use client"

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'
import {
  FolderIcon,
  UsersIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { UserNotificationCountResponse, UserProjectCountResponse } from '@/backend/interfaces/user/request';
import { UserType } from '@/backend/interfaces/user';

const UserNavigation: React.FC = () => {
    const pathname = usePathname()
    const { data: session, status } = useSession()

    // repo count state
    const [repoCount, setRepoCount] = useState(0)
    const [notificationCount, setNotificationCount] = useState(0)

    const navigation = [
        { name: 'Accounts', href: '/admin/accounts', icon: UsersIcon, current: pathname === '/admin/accounts', userTypeAllowed: [UserType.ADMIN] },
        { name: 'Projects', href: '/admin/projects', icon: FolderIcon, count: repoCount, current: pathname === '/admin/projects', userTypeAllowed: [UserType.ADMIN] },
        { name: 'Notifications', href: '/admin/notifications', icon: BellIcon, count: notificationCount, current: pathname === '/admin/notifications', userTypeAllowed: [UserType.ADMIN] },
      ]

      function classNames(...classes: string[]) {
        return classes.filter(Boolean).join(' ')
      }

      useEffect(() => {
        console.log("session", session)
        const fetchRepoCount = async () => {

          const res = await axios({
            url: `${process.env.API_URL}/api/v1/projects/${session?.user.id}/count`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user.jwt}`
            },
            timeout: 60000,
            timeoutErrorMessage: 'Request timed out. Please try again.',
          })

          const data:UserProjectCountResponse = res.data;
          if (data.success) {
            setRepoCount(data.count)
          }
        }
        const fetchNotificationCount = async () => {

          const res = await axios({
            url: `${process.env.API_URL}/api/v1/notifications/${session?.user.id}/count`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user.jwt}`
            },
            timeout: 60000,
            timeoutErrorMessage: 'Request timed out. Please try again.',
          })

          const data:UserNotificationCountResponse = res.data;
          if (data.success) {
            setNotificationCount(data.count)
          }
        }
        
        fetchRepoCount()
        fetchNotificationCount()

      }, [])

    return (
        <>
        {navigation.filter( menuItem => session && menuItem.userTypeAllowed.includes(session.user.type) ).map((item) => (
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
                <span className="truncate hidden 2xs:block">
                {item.name}
                </span>
                {item.count || item.count === 0 && (notificationCount !== 0) ? (
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