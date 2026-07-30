import { User } from './User.js';
import { Property } from './Property.js';
export type NotificationType = 'property_view' | 'property_fit_match';
export declare class Notification {
    id: string;
    recipientId: string;
    recipient: User;
    propertyId: string | null;
    property: Property | null;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    actorName: string | null;
    actorEmail: string | null;
    actorPhone: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
//# sourceMappingURL=Notification.d.ts.map