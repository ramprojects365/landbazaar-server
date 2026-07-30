import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController.js';
const router = Router();
router.get('/', authenticateToken, notificationController.getNotifications);
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);
router.patch('/read-all', authenticateToken, notificationController.markAllNotificationsRead);
router.patch('/:id/read', authenticateToken, notificationController.markNotificationRead);
export default router;
//# sourceMappingURL=notificationRoutes.js.map