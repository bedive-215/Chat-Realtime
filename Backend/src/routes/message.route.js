import { Router } from "express";
import { getMessage } from "../controllers/message.controller.js";

const router = Router();

// GET /api/messages/123?limit=20&before=2025-09-01T00:00:00.000Z
router.get("/messages/:chatId", getMessage);

export default router;
