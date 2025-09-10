import { Router } from 'express';
import { updateProfile } from "../controllers/profile.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post('/update-profile', upload.single("image"), updateProfile);

export default router;
