import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import routerAuth from './auth.route.js';
import routerProfile from './profile.route.js';
import routerFriend from './friend.route.js';
import routerChat from './chat.route.js';
import routerMessage from './message.route.js';
import routerNotification from './notification.route.js';
import routerSearch from './search.route.js';

const router = Router();

router.use('/public',routerAuth);

// dung xac thuc cho toan bo router user
router.use('/user', authMiddleware);
router.use('/user', routerProfile);
router.use('/user', routerFriend);
router.use('/user', routerChat);
router.use('/user', routerMessage);
router.use('/user', routerNotification);
router.use('/user', routerSearch);

export default router;