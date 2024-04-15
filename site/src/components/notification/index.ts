import { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react'
import { GetNotificationsQueryParams, GetNotificationsResponse } from '@/backend/interfaces/notification/request';
import { LoadNotifications } from '@/interfaces/notification';
import type { Notification } from '@/backend/interfaces/notification';

export default function useNotifications({...props}: GetNotificationsQueryParams):LoadNotifications {
  const [searchProps, setSearchProps] = useState<GetNotificationsQueryParams>(props);
  const [notifications, setNotifications] = useState<GetNotificationsResponse>(generatePlaceHolderNotifications(searchProps.limit || 10));
  const [reqStatus, setReqStatus] = useState('idle'); // idle, loading, success, error
  
  const { data: session, status } = useSession()
  useEffect(() => {

    // Fetch notifications
    const fetchData = async () => {
        setReqStatus('loading');
      try {
        // Build query string

        // Set the limit of the number of notifications to fetch
        let queryStr = searchProps.limit ? `?limit=${searchProps.limit}` : '';
        // Set the cursor to the next 'page' of notifications
        if (searchProps.cursor) queryStr += `${queryStr ? '&' : '?'}cursor=${searchProps.cursor}`;

        // sleep for 2 seconds to simulate a slow network
        await new Promise((resolve) => setTimeout(resolve, 4000));
        const response = await fetch(`${process.env.API_URL}/api/user/notifications` + queryStr, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.user.jwt}`
            }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData:GetNotificationsResponse = await response.json();
        setNotifications(jsonData);
        updateData(jsonData);

        setReqStatus('success');
      } catch (error) {
        setReqStatus('error');
        console.error('Error fetching data:', error);
      }
    };

    const updateData = async (jsonData:GetNotificationsResponse) => {
      // Cleanup function, set read status to true
      if (jsonData) {
        let notificationIDs:string[] = []
        if(jsonData.notifications){
          notificationIDs = jsonData.notifications.filter((n:Notification)=> !n.read).map((n:Notification) => n.id);
        }
        await fetch(`${process.env.API_URL}/api/user/notifications`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user.jwt}`
          },
          body: JSON.stringify({
            notificationIDs: notificationIDs,
            read: true
          })
        });
      }
  };

    fetchData();
    return () => {
      // 
  
    };
  }, [searchProps]);


    const retVal:LoadNotifications = {
        reqStatus,
        loadedNotifications: notifications.notifications || null,
        setSearchProps: setSearchProps
    }
    return retVal;

};

function generatePlaceHolderNotifications(count:number):GetNotificationsResponse {
  let placeHolderNotifications = [];
  for (let i = 0; i < count; i++) {

    // const seededRand = require('random-seed').create(`A ${i}` )
    // const seededRand = require('random-seed').create(`E${i}` )
    // const seededRand = require('random-seed').create(`H${i}` )
    // const seededRand = require('random-seed').create(`H${i}` )

    const random = Math.floor(Math.random() * 1000) + 1;
    const longString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut \
labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

    const placeHolderNotification:Notification = {
        id: i.toString(),
        type: 'SKELETON',
        title: `This is a placeholder notification title ${i}`,
        message: random > 600 ? `This is a placeholder notification message ${i}` : longString,
        about: `SKELETON`,
        read: true,
        userID: i.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
    }
    placeHolderNotifications.push(placeHolderNotification);
  }
  return {
    success: true,
    notifications: placeHolderNotifications
  }
}
