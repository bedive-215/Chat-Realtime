import { updateProfile } from "../controllers/profile.controller.js";
import { Router } from 'express';

const router = Router();

router.post('/updata-profile', updateProfile);

export default router;