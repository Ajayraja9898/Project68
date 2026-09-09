import express from "express";

import {
  register,
  login,
  logout,
  changePassword,
  getMe,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================
// Authentication
// ======================

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

// ======================
// Change Password
// ======================

router.post("/change-password", protect, changePassword);

// ======================
// Protected Routes
// ======================

router.get("/me", protect, getMe);

export default router;