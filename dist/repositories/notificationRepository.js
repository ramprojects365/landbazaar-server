import { AppDataSource } from '../config/database.js';
import { Notification } from '../entities/Notification.js';
export const createNotification = async (notificationData) => {
    const repository = AppDataSource.getRepository(Notification);
    const notification = repository.create(notificationData);
    return await repository.save(notification);
};
export const findNotificationsByRecipient = async (recipientId, options = {}) => {
    const repository = AppDataSource.getRepository(Notification);
    const query = repository
        .createQueryBuilder('notification')
        .leftJoinAndSelect('notification.property', 'property')
        .where('notification.recipientId = :recipientId', { recipientId })
        .orderBy('notification.createdAt', 'DESC')
        .take(options.limit ?? 30);
    if (options.unreadOnly) {
        query.andWhere('notification.isRead = false');
    }
    return await query.getMany();
};
export const countUnreadNotifications = async (recipientId) => {
    const repository = AppDataSource.getRepository(Notification);
    return await repository.count({
        where: {
            recipientId,
            isRead: false
        }
    });
};
export const markNotificationRead = async (notificationId, recipientId) => {
    const repository = AppDataSource.getRepository(Notification);
    const notification = await repository.findOne({
        where: {
            id: notificationId,
            recipientId
        },
        relations: ['property']
    });
    if (!notification) {
        return null;
    }
    notification.isRead = true;
    return await repository.save(notification);
};
export const markAllNotificationsRead = async (recipientId) => {
    const repository = AppDataSource.getRepository(Notification);
    const result = await repository.update({ recipientId, isRead: false }, { isRead: true });
    return result.affected ?? 0;
};
//# sourceMappingURL=notificationRepository.js.map