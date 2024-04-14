


import { Notification } from '@/backend/interfaces/notification';
import { GetNotificationsQueryParams } from '@/backend/interfaces/notification/request';


export interface LoadNotifications {
    reqStatus: string,
    loadedNotifications: Notification[]
    setSearchProps: React.Dispatch<React.SetStateAction<GetNotificationsQueryParams>>
  }
