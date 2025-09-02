import { Router } from "express";
import routerAuth from './auth.route.js';
import routerProfile from './profile.route.js';
import routerFriend from './friend.route.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use('/public',routerAuth);

// dung xac thuc cho toan bo router user
router.use('/user', authMiddleware);
router.use('/user', routerProfile);
router.use('/user', routerFriend);

export default router;