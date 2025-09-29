import { Router } from 'express';
import { getNotifications, markAsRead} from '../controllers/notification.controller.js';

const router = Router();

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markAsRead);

export default router;