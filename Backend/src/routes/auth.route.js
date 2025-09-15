import { Router } from 'express';
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {signUp, signIn, logout, checkAuth} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.post('/logout', logout);
router.get('/check-auth', authMiddleware, checkAuth);

export default router;