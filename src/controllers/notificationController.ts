import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService.js';
import { AppError } from '../utils/errors.js';

const parseLimit = (value: unknown): number | undefined => {
  const parsed = parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(Math.max(parsed, 1), 100);
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const result = await notificationService.getUserNotifications(userId, {
      unreadOnly: req.query.unreadOnly === 'true',
      limit: parseLimit(req.query.limit)
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }

    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const unreadCount = await notificationService.getUnreadCount(userId);
    res.status(200).json({ success: true, unreadCount });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const notification = await notificationService.markNotificationRead(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }

    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const updatedCount = await notificationService.markAllNotificationsRead(userId);
    res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
      updatedCount
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};
