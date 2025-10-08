import { Router } from 'express';
import { getNotifications, markAsRead, deleteNotification} from '../controllers/notification.controller.js';

const router = Router();

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markAsRead);
router.delete('/notification/:id', deleteNotification);

export default router;