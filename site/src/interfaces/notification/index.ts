


import { Notification } from '@/backend/interfaces/notification';
import { GetNotificationsQueryParams } from '@/backend/interfaces/notification/request';


export interface LoadNotifications {
    reqStatus: string,
    loadedNotifications: Notification[] | null
    setSearchProps: React.Dispatch<React.SetStateAction<GetNotificationsQueryParams>>
  }
