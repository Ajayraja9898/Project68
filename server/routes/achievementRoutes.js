import express from "express";

import {
  getAchievements,
  getAchievementById,
} from "../controllers/achievementController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/achievement
router.get(
  "/",
  protect,
  getAchievements
);

// GET /api/achievement/:achievementId
router.get(
  "/:achievementId",
  protect,
  getAchievementById
);

export default router;