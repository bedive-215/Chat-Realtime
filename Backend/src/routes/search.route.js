import { Router } from 'express';
import { searchUsers } from "../controllers/search.controller.js";


const router = Router();

router.get('/search', searchUsers);

export default router;
