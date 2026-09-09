import express from "express";

import {
  sendInvite,
  getPendingInvites,
  searchStudent,
  acceptInvite,
  declineInvite,
} from "../controllers/inviteController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================
   Search Student by Roll Number
========================================== */

router.get("/search/:rollNumber", protect, searchStudent);

/* ==========================================
   Send Anonymous Invite
========================================== */

router.post("/send", protect, sendInvite);

/* ==========================================
   Get Pending Invites
========================================== */

router.get("/pending", protect, getPendingInvites);

/* ==========================================
   Accept Invite
========================================== */

router.post("/accept/:inviteId", protect, acceptInvite);

/* ==========================================
   Decline Invite
========================================== */

router.post("/decline/:inviteId", protect, declineInvite);

export default router;