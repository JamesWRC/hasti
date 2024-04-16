"use client"

import { useEffect, useRef, useState } from 'react'
import {
  EyeSlashIcon,
  CubeTransparentIcon,
  UserIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/20/solid'
import { Listbox, Transition } from '@headlessui/react'
import useNotifications from '@/frontend/components/notification'
import moment from 'moment'
import { Button, HoverCard, Skeleton } from '@mantine/core'
import { GitBranchIcon } from '@primer/octicons-react'
import type { Notification, } from '@/backend/interfaces/notification';
import { GetNotificationsQueryParams } from '@/backend/interfaces/notification/request'
import { set } from 'lodash'
import { DynamicSkeletonText, DynamicSkeletonTitle } from '@/frontend/components/ui/skeleton'


// types
/*
info - nothing
success - check-circle
warning - exclamation-triangle
error - x-circle
*/

// about
/*
project - cube-transparent 
user - user
repo - <GitBranchIcon/>
general - info
*/

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function setIconColor(type: string) {
  switch (type) {
    case 'info':
      return 'bg-gray-300 text-white'
    case 'success':
      return 'bg-green-600 text-white'
    case 'warning':
      return 'bg-yellow-500 text-white'
    case 'error':
      return 'bg-red-600 text-white'
    default:
      return 'bg-gray-400 text-white'
  }
}


function setAboutIcon(notification: Notification): React.ReactNode {
  const type: string = notification.type
  const about: string = notification.about
  const read: boolean = notification.read
  let icon: React.ReactNode | null;
  switch (about) {
    case 'project':
      icon = <CubeTransparentIcon className="h-6 w-6 p-[0.15rem]" aria-hidden="true" />
      break;
    case 'user':
      icon = <UserIcon className="h-6 w-6 p-[0.15rem]" />
      break;
    case 'repo':
      icon = <GitBranchIcon className="h-6 w-6 p-[0.15rem]" aria-hidden="true" />
      break;
    case 'general':
      icon = null
      break;
    case 'SKELETON': // Used for loading state of notifications until they are fetched
      icon = <Skeleton height={10} mt={6} radius="xl" width={10}/>

      break;
    default:
      icon = <QuestionMarkCircleIcon className="h-6 w-6 p-[0.15rem]" aria-hidden="true" />
      break;
  }

  return <HoverCard width={250} shadow="md" withArrow openDelay={50} closeDelay={100}>
<HoverCard.Target>

  <div className='flex justify-between'>
    <div className={classNames(
      about === "general" ? 'ml-1.5 h-3 w-3' : 'h-6 w-6', 
      'flex-none items-center justify-center rounded-full', setIconColor(type))}>{icon}</div>
    <EyeSlashIcon className={classNames( 
      read ? 'hidden' : '',
      about === "general" ? 'pb-1 h-4 w-4' : 'h-4 w-4', 
      'flex-none items-center justify-center rounded-full text-gray-400')} aria-hidden="true" />
  </div>
  </HoverCard.Target>
  <HoverCard.Dropdown>
  <h3 className='text-bold text-xl'>Notification details</h3><hr/>
  <div className='text-bold flex justify-between'>Type:<div className='text-bold'>{notification.type}</div></div>
  <div className='text-bold flex justify-between'>Event type:<div className='text-sm'>{notification.about}</div></div>
  <div className='text-bold flex justify-between'>Title:<div className='text-sm'>{notification.title}</div></div>

  <div className='text-bold'>Notified at:</div><div className='text-sm'>{new Date(notification.createdAt).toISOString()}</div>
</HoverCard.Dropdown>
  </HoverCard>


}



export default function Notifications() {
  const SEARCH_LIMIT:number = 50
  const [notificationProps, setNotificationProps] = useState<GetNotificationsQueryParams>({ 
    limit: SEARCH_LIMIT
  })
  const { loadedNotifications, reqStatus, setSearchProps } = useNotifications(notificationProps);


  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState<boolean>(false);
  const [noMoreResults, setNoMoreResults] = useState<boolean>(false);
  const scrollRef  = useRef<HTMLDivElement>(null);


  function handleLoadMoreNotifications(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setLoading(true)

    e.preventDefault()
    const notifProps: GetNotificationsQueryParams = { ...notificationProps, limit: SEARCH_LIMIT}
    if (loadedNotifications) {
      notifProps.cursor = loadedNotifications[loadedNotifications.length - 1].id
    }
    setSearchProps(notifProps)

    setLoading(false)
    setNotifications(notifications)

  }

  useEffect(() => {
    // Update the notifications list with the new notifications so the list can be appended, rendered without removing last notifications
    if(reqStatus === 'success' && loadedNotifications && loadedNotifications.length > 0){
      setNotifications([...notifications, ...loadedNotifications])
    }

    // Set scroll back to top after skeleton loading.
    if(notifications.length == 0 && scrollRef && scrollRef.current){
      scrollRef.current.scrollTop = 0
    // Keep the scroll at the bottom
    } else if(scrollRef && scrollRef.current){
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    if(loadedNotifications && loadedNotifications.length < SEARCH_LIMIT){
      console.log('no more notifications')
      setNoMoreResults(true)
      setLoading(true)
    }
    
  },[loadedNotifications])




  return (
    <div className='h-full max-h-[97vh] overflow-y-scroll scrollbar overflow-x-hidden grid' ref={scrollRef} >
      <ul role="list" className="space-y-6 px-4 justify-self-center" >
        {notifications.length > 0 ? notifications.map((notification: Notification, notificationIndex: number) => (
          <li 
            key={notification.id} 
            className={classNames("relative flex gap-x-4 first:pt-4 md:first:pt-8 last:pb-24 md:last:pb-12")}>
            <div
              className={classNames(
                notificationIndex === 0 ? 'mt-14' : '',
                notification.about === 'general' ? 'mt-0' : 'mt-6',
                '-bottom-6 absolute left-0 top-0 flex w-6 justify-center z-0'
              )}
            >
              <div className="w-px bg-gray-200" />
            </div>
            {notification.message.length > 100 ? (
              <>
                {/* <img
                  src="{activityItem.about.imageUrl}"
                  alt=""
                  className="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50"
                /> */}
                {setAboutIcon(notification)}
                <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs leading-5 text-gray-500">
                      {notification.about}: <span className="font-medium text-gray-900">{notification.title}</span>
                    </div>
                    <HoverCard width={200} shadow="md" withArrow openDelay={50} closeDelay={100}>
                      <HoverCard.Target>
                        <time dateTime={new Date(notification.createdAt).toISOString()} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                          {moment(notification.createdAt).fromNow()}
                        </time>
                      </HoverCard.Target>
                      <HoverCard.Dropdown>
                        <div className='text-sm'>{new Date(notification.createdAt).toISOString()}</div>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  </div>
                  <p className="text-sm leading-6 text-gray-500">{notification.message}</p>
                </div>
              </>
            ) : (
              <>
              {setAboutIcon(notification)}
                <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                  {notification.about}: <span className="font-medium text-gray-900">{notification.title}</span>  <br />
                  {notification.message}
                </p>
                <HoverCard width={200} shadow="md" withArrow openDelay={50} closeDelay={100}>
                  <HoverCard.Target>
                    <time dateTime={new Date(notification.createdAt).toISOString()} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                    <div className='text-xs italic'>{!notification.read ? 'unread' : null}</div>{moment(notification.createdAt).fromNow()}
                    </time>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <div className='text-sm'>{new Date(notification.createdAt).toISOString()}</div>
                  </HoverCard.Dropdown>
                </HoverCard>
              </>
            )}

          </li>

        )) : (notifications.length === 0 && loadedNotifications && loadedNotifications.length !== 0) ? loadedNotifications.map((notification: Notification, notificationIndex: number) => ( 
          <li key={`notif-skeleton-${notification.id}`} className="relative flex gap-x-4 first:pt-4 md:first:pt-8 last:pb-24 md:last:pb-12 pl-12">
                        <div
              className={classNames(
                '-bottom-6 absolute left-0 top-0 flex w-6 justify-center pl-4'
              )}
            >
              <div className="w-px bg-gray-200" />
            </div>
            {renderSkeletonPlaceholder(notification, notificationIndex)}
          </li>
          ))
        :  <div className='p-10'>No Notifications</div> }

      </ul>
      <div className=' justify-self-center text-content-body '>
      <div className={noMoreResults? 'px-auto' : 'hidden'}>No more notifications found</div>
      <Button
        loading={reqStatus === "loading"}
        className={!noMoreResults ? 'text-content-body justify-self-center text-bold border border-spacing-1 border-gray-500 rounded-md' : 'hidden'}
        onClick={(e) => handleLoadMoreNotifications(e)}>{reqStatus === "success" ? "Load more" : reqStatus + "..."}</Button>

      </div>
      
    </div>
  )
}


function renderSkeletonPlaceholder(notification: Notification, notificationIndex: number) {
  return (
    <>
        {/* {setAboutIcon(notification)} */}
        <div className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
          <DynamicSkeletonTitle/> <br />
          <DynamicSkeletonText/>

        </div>

    </>

  )
}