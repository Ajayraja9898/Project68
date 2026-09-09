import express from "express";

import {
  getOrCreateChat,
  getUserChats,
  getChatById,
  updateChatDeletionMode,
} from "../controllers/chatController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================
   Get All Chats
========================================== */

router.get("/", protect, getUserChats);

/* ==========================================
   Get Single Chat
========================================== */

router.get("/:chatId", protect, getChatById);

/* ==========================================
   Create Or Get Private Chat
========================================== */

router.post("/private", protect, getOrCreateChat);

/* ==========================================
   Update Chat Retention Mode
========================================== */

router.patch(
  "/:chatId/retention",
  protect,
  updateChatDeletionMode
);

export default router;