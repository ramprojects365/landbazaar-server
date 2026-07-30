import { Notification } from '../entities/Notification.js';
export declare const createNotification: (notificationData: Partial<Notification>) => Promise<Notification>;
export declare const findNotificationsByRecipient: (recipientId: string, options?: {
    unreadOnly?: boolean;
    limit?: number;
}) => Promise<Notification[]>;
export declare const countUnreadNotifications: (recipientId: string) => Promise<number>;
export declare const markNotificationRead: (notificationId: string, recipientId: string) => Promise<Notification | null>;
export declare const markAllNotificationsRead: (recipientId: string) => Promise<number>;
//# sourceMappingURL=notificationRepository.d.ts.map