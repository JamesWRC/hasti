
import type { Notification } from "@prisma/client";
import type { NotificationAbout, NotificationType } from '@/interfaces/notification';

export interface GetNotificationsQueryParams {
    limit?: number;
    type?: NotificationType;
    about?: NotificationAbout;
    cursor?: string;
    userID?: string;
    username?: string;
    githubUserID?: number;
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