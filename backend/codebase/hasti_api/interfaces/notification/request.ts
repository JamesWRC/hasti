
import type { Notification } from "@prisma/client";
import { NotificationAbout, NotificationType } from '@/backend/interfaces/notification';

export interface GetNotificationsQueryParams {
    limit?: number;
    type?: NotificationType;
    about?: NotificationAbout;
    cursor?: string;
    userID?: string;
    username?: string;
    githubUserID?: number;
    orderBy?: 'createdAt' | 'updatedAt' | 'title' | 'author';
    orderDirection?: 'asc' | 'desc';
}

export interface GetNotificationsResponse {
    success: boolean;
    notifications: Notification[] | null;
}


export interface UpdateNotificationReadStatus {
    notificationIDs: string[];
    read: boolean;
}

export interface UpdateNotificationReadStatusResponse {
    success: boolean;
    updatedCount: number;
    message: string;
}