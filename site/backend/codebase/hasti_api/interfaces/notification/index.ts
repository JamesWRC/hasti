import { Notification } from '@prisma/client';

export enum NotificationType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
}

export enum NotificationAbout {
    PROJECT = 'project',
    USER = 'user',
    REPO = 'repo',
    GENERAL = 'general'
}


export function getNotificationType(type: string): NotificationType {
    const values = Object.values(NotificationType);
    for(const t in values){
        if(values[t] === type.toLowerCase()){
            return values[t];
        }
    }
    // If the notification type is not found, return info
    return NotificationType.INFO;
}

export function getNotificationAbout(about: string): NotificationAbout {
    const values = Object.values(NotificationAbout);
    for(const t in values){
        if(values[t] === about.toLowerCase()){
            return values[t];
        }
    }
    // If the notification about is not found, return general
    return NotificationAbout.GENERAL;
}