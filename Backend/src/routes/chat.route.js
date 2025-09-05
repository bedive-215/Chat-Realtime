import { createChat, getChatId } from "../controllers/chat.controller.js";
import { Router } from 'express';

const router = Router();

router.post('/chats',createChat);
router.get('/chats', getChatId);

export default router;