import { updateProfile } from "../controllers/profile.controller.js";
import { Router } from 'express';

const router = Router();

router.post('/update-profile', updateProfile);

export default router;