import * as notificationRepository from '../repositories/notificationRepository.js';
import * as propertyRepository from '../repositories/propertyRepository.js';
import { AppError } from '../utils/errors.js';
const clean = (value) => {
    return typeof value === 'string' ? value.trim() : '';
};
const getDisplayName = (name, email) => {
    return clean(name) || clean(email).split('@')[0] || 'A visitor';
};
const getPropertyTitle = (property) => {
    return property.propertyName || property.title || 'your property';
};
export const createPropertyViewNotification = async (input) => {
    const property = await propertyRepository.findPropertyById(input.propertyId);
    if (!property) {
        throw new AppError('Property not found', 404);
    }
    if (!property.userId) {
        return null;
    }
    const viewerName = getDisplayName(input.viewerName, input.viewerEmail);
    const propertyTitle = getPropertyTitle(property);
    return await notificationRepository.createNotification({
        recipientId: property.userId,
        propertyId: property.id,
        type: 'property_view',
        title: 'Property viewed',
        message: `${viewerName} viewed ${propertyTitle}`,
        actorName: viewerName,
        actorEmail: clean(input.viewerEmail) || null,
        actorPhone: clean(input.viewerPhone) || null,
        metadata: {
            propertyTitle,
            propertyUrl: clean(input.propertyUrl) || null
        }
    });
};
export const createPropertyFitMatchNotification = async (input) => {
    const property = input.property;
    if (!property.userId) {
        return null;
    }
    const viewerName = getDisplayName(input.viewerName, input.viewerEmail);
    const propertyTitle = getPropertyTitle(property);
    return await notificationRepository.createNotification({
        recipientId: property.userId,
        propertyId: property.id,
        type: 'property_fit_match',
        title: 'New property advisor lead',
        message: `${viewerName} matched with ${propertyTitle}`,
        actorName: viewerName,
        actorEmail: clean(input.viewerEmail) || null,
        actorPhone: clean(input.viewerPhone) || null,
        metadata: {
            propertyTitle,
            propertyUrl: clean(input.propertyUrl) || null,
            intent: clean(input.intent) || null,
            location: clean(input.location) || null,
            budgetAmount: input.budgetAmount ?? null,
            bedrooms: clean(input.bedrooms) || null
        }
    });
};
export const getUserNotifications = async (userId, options = {}) => {
    const notifications = await notificationRepository.findNotificationsByRecipient(userId, options);
    const unreadCount = await notificationRepository.countUnreadNotifications(userId);
    return {
        unreadCount,
        count: notifications.length,
        data: notifications
    };
};
export const getUnreadCount = async (userId) => {
    return await notificationRepository.countUnreadNotifications(userId);
};
export const markNotificationRead = async (notificationId, userId) => {
    const notification = await notificationRepository.markNotificationRead(notificationId, userId);
    if (!notification) {
        throw new AppError('Notification not found', 404);
    }
    return notification;
};
export const markAllNotificationsRead = async (userId) => {
    return await notificationRepository.markAllNotificationsRead(userId);
};
//# sourceMappingURL=notificationService.js.map