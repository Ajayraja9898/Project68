import express from "express";

import {
  getAvailablePartners,
  sendPartnerInvite,
} from "../controllers/partnerController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// AVAILABLE PARTNERS
// ======================================================

router.get(
  "/available",
  protect,
  getAvailablePartners
);

// ======================================================
// SEND PARTNER INVITE
// ======================================================

router.post(
  "/invite",
  protect,
  sendPartnerInvite
);

export default router;