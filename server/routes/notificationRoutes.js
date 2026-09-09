import express from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// GET ALL NOTIFICATIONS
// GET /api/notification
// ==========================================

router.get(
  "/",
  protect,
  getNotifications
);

// ==========================================
// GET UNREAD COUNT
// GET /api/notification/unread-count
// ==========================================

router.get(
  "/unread-count",
  protect,
  getUnreadNotificationCount
);

// ==========================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notification/:notificationId/read
// ==========================================

router.patch(
  "/:notificationId/read",
  protect,
  markNotificationAsRead
);

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notification/read-all
// ==========================================

router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

export default router;