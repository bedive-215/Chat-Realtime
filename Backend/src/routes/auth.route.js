import { Router } from 'express';
import {signUp, signIn, logout} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.post('/logout', logout);

export default router;