import express from "express";

import {
  getAdminDashboard,
  getAdminUsers,

  suspendUser,
  unsuspendUser,

  // Private chat monitoring
  getAdminChats,
  getAdminChatById,
  adminDeleteChatMessage,
  adminCloseChat,

  // Community chat monitoring
  getAdminCommunityMessages,
  getAdminCommunityMessageById,
  adminDeleteCommunityMessage,
} from "../controllers/adminController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getAdminDashboard
);

// ======================================================
// ALL USERS
// ======================================================

router.get(
  "/users",
  protect,
  adminOnly,
  getAdminUsers
);

// ======================================================
// SUSPEND USER
// ======================================================

router.patch(
  "/users/:userId/suspend",
  protect,
  adminOnly,
  suspendUser
);

// ======================================================
// UNSUSPEND USER
// ======================================================

router.patch(
  "/users/:userId/unsuspend",
  protect,
  adminOnly,
  unsuspendUser
);

// ======================================================
// PRIVATE CHAT MONITORING
// ======================================================

// ------------------------------------------------------
// Get all active private chats
// GET /api/admin/chats
// ------------------------------------------------------

router.get(
  "/chats",
  protect,
  adminOnly,
  getAdminChats
);

// ------------------------------------------------------
// Get one private chat + messages
// GET /api/admin/chats/:chatId
// ------------------------------------------------------

router.get(
  "/chats/:chatId",
  protect,
  adminOnly,
  getAdminChatById
);

// ------------------------------------------------------
// Delete private-chat message
// DELETE /api/admin/chats/:chatId/messages/:messageId
// ------------------------------------------------------

router.delete(
  "/chats/:chatId/messages/:messageId",
  protect,
  adminOnly,
  adminDeleteChatMessage
);

// ------------------------------------------------------
// Close private chat
// PATCH /api/admin/chats/:chatId/close
// ------------------------------------------------------

router.patch(
  "/chats/:chatId/close",
  protect,
  adminOnly,
  adminCloseChat
);

// ======================================================
// COMMUNITY CHAT MONITORING
// ======================================================

// ------------------------------------------------------
// Get community chat messages
//
// GET /api/admin/community-chat
//
// Returns:
// - anonymous identity
// - real author
// - message
// - image
// - reply
// - retention
// - expiry
// - moderation information
// ------------------------------------------------------

router.get(
  "/community-chat",
  protect,
  adminOnly,
  getAdminCommunityMessages
);

// ------------------------------------------------------
// Get one community message
//
// GET /api/admin/community-chat/:messageId
// ------------------------------------------------------

router.get(
  "/community-chat/:messageId",
  protect,
  adminOnly,
  getAdminCommunityMessageById
);

// ------------------------------------------------------
// Delete community message
//
// DELETE /api/admin/community-chat/:messageId
// ------------------------------------------------------

router.delete(
  "/community-chat/:messageId",
  protect,
  adminOnly,
  adminDeleteCommunityMessage
);

export default router;