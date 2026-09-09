import express from "express";

import {
  // ==================================================
  // Community Posts
  // ==================================================

  getPosts,
  createPost,
  getComments,
  createComment,
  togglePostLike,
  toggleCommentLike,
  deleteOwnPost,
  deleteOwnComment,

  // ==================================================
  // Community Chat
  // ==================================================

  getCommunityMessages,
  sendCommunityMessage,
  deleteCommunityMessage,

  // ==================================================
  // Admin Moderation
  // ==================================================

  getAdminCommunityPosts,
  adminRemovePost,
  adminRestorePost,
  getAdminCommunityComments,
  adminRemoveComment,
  adminRestoreComment,
} from "../controllers/communityController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// ADMIN COMMUNITY MODERATION
// ======================================================
//
// IMPORTANT:
// These routes MUST appear before routes such as
// "/:postId" so "admin" is not interpreted as an ID.
//
// Every route uses:
//
// protect
//    ↓
// adminOnly
//
// ======================================================

// ------------------------------------------------------
// GET ALL COMMUNITY POSTS FOR ADMIN
// GET /api/community/admin/posts
// ------------------------------------------------------

router.get(
  "/admin/posts",
  protect,
  adminOnly,
  getAdminCommunityPosts
);

// ------------------------------------------------------
// REMOVE COMMUNITY POST
// DELETE /api/community/admin/posts/:postId
// ------------------------------------------------------

router.delete(
  "/admin/posts/:postId",
  protect,
  adminOnly,
  adminRemovePost
);

// ------------------------------------------------------
// RESTORE COMMUNITY POST
// PATCH /api/community/admin/posts/:postId/restore
// ------------------------------------------------------

router.patch(
  "/admin/posts/:postId/restore",
  protect,
  adminOnly,
  adminRestorePost
);

// ------------------------------------------------------
// GET ALL COMMUNITY COMMENTS FOR ADMIN
// GET /api/community/admin/comments
// ------------------------------------------------------

router.get(
  "/admin/comments",
  protect,
  adminOnly,
  getAdminCommunityComments
);

// ------------------------------------------------------
// REMOVE COMMUNITY COMMENT
// DELETE /api/community/admin/comments/:commentId
// ------------------------------------------------------

router.delete(
  "/admin/comments/:commentId",
  protect,
  adminOnly,
  adminRemoveComment
);

// ------------------------------------------------------
// RESTORE COMMUNITY COMMENT
// PATCH /api/community/admin/comments/:commentId/restore
// ------------------------------------------------------

router.patch(
  "/admin/comments/:commentId/restore",
  protect,
  adminOnly,
  adminRestoreComment
);

// ======================================================
// COMMUNITY CHAT
// ======================================================

// ------------------------------------------------------
// Get community chat messages
// GET /api/community/chat/messages
// ------------------------------------------------------

router.get(
  "/chat/messages",
  protect,
  getCommunityMessages
);

// ------------------------------------------------------
// Send community chat message
// POST /api/community/chat/messages
// ------------------------------------------------------
//
// This route is kept for REST-based community messaging.
// Socket.IO can continue to handle live messages separately.
//
// ------------------------------------------------------

router.post(
  "/chat/messages",
  protect,
  sendCommunityMessage
);

// ------------------------------------------------------
// Delete community chat message
// DELETE /api/community/chat/messages/:messageId
// ------------------------------------------------------
//
// ADMIN ONLY
// ------------------------------------------------------

router.delete(
  "/chat/messages/:messageId",
  protect,
  adminOnly,
  deleteCommunityMessage
);

// ======================================================
// COMMUNITY POSTS
// ======================================================

// ------------------------------------------------------
// Get all visible posts
// GET /api/community
// ------------------------------------------------------

router.get(
  "/",
  protect,
  getPosts
);

// ------------------------------------------------------
// Create post
// POST /api/community
// ------------------------------------------------------

router.post(
  "/",
  protect,
  createPost
);

// ------------------------------------------------------
// Delete own post
// DELETE /api/community/:postId
// ------------------------------------------------------

router.delete(
  "/:postId",
  protect,
  deleteOwnPost
);

// ------------------------------------------------------
// Like / unlike post
// POST /api/community/:postId/like
// ------------------------------------------------------

router.post(
  "/:postId/like",
  protect,
  togglePostLike
);

// ======================================================
// COMMUNITY COMMENTS
// ======================================================

// ------------------------------------------------------
// Get comments for a post
// GET /api/community/:postId/comments
// ------------------------------------------------------

router.get(
  "/:postId/comments",
  protect,
  getComments
);

// ------------------------------------------------------
// Create comment
// POST /api/community/:postId/comments
// ------------------------------------------------------

router.post(
  "/:postId/comments",
  protect,
  createComment
);

// ------------------------------------------------------
// Like / unlike comment
// POST /api/community/comments/:commentId/like
// ------------------------------------------------------

router.post(
  "/comments/:commentId/like",
  protect,
  toggleCommentLike
);

// ------------------------------------------------------
// Delete own comment
// DELETE /api/community/comments/:commentId
// ------------------------------------------------------

router.delete(
  "/comments/:commentId",
  protect,
  deleteOwnComment
);

export default router;