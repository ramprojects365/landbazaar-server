import { Property } from '../entities/Property.js';
type PropertyViewNotificationInput = {
    propertyId: string;
    viewerName?: string;
    viewerEmail?: string;
    viewerPhone?: string;
    propertyUrl?: string;
};
type PropertyFitMatchNotificationInput = {
    property: Property;
    viewerName?: string;
    viewerEmail?: string;
    viewerPhone?: string;
    propertyUrl?: string;
    intent?: string;
    location?: string;
    budgetAmount?: string | number;
    bedrooms?: string;
};
export declare const createPropertyViewNotification: (input: PropertyViewNotificationInput) => Promise<import("../entities/Notification.js").Notification | null>;
export declare const createPropertyFitMatchNotification: (input: PropertyFitMatchNotificationInput) => Promise<import("../entities/Notification.js").Notification | null>;
export declare const getUserNotifications: (userId: string, options?: {
    unreadOnly?: boolean;
    limit?: number;
}) => Promise<{
    unreadCount: number;
    count: number;
    data: import("../entities/Notification.js").Notification[];
}>;
export declare const getUnreadCount: (userId: string) => Promise<number>;
export declare const markNotificationRead: (notificationId: string, userId: string) => Promise<import("../entities/Notification.js").Notification>;
export declare const markAllNotificationsRead: (userId: string) => Promise<number>;
export {};
//# sourceMappingURL=notificationService.d.ts.map