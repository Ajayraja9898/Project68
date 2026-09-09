import express from "express";

import {
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================
   Get Messages of Chat
========================================== */

router.get("/:chatId", protect, getMessages);

/* ==========================================
   Send Message
========================================== */

router.post("/", protect, sendMessage);

export default router;