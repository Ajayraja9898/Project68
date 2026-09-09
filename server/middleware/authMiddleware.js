import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ======================================================
// PROTECT ROUTES
// ======================================================
//
// Authentication flow:
//
// 1. Read JWT from cookie
// 2. Read JWT from Authorization header
// 3. Verify JWT
// 4. Load user from database
// 5. Check account status
// 6. Attach user to req.user
//
// A suspended account is rejected even when its JWT is
// still technically valid.
// ======================================================

export const protect = async (
  req,
  res,
  next
) => {
  try {
    let token = null;

    // --------------------------------------------------
    // Read token from cookie
    // --------------------------------------------------

    if (
      req.cookies?.token
    ) {
      token =
        req.cookies.token;
    }

    // --------------------------------------------------
    // Read token from Authorization header
    // --------------------------------------------------

    if (
      !token &&
      req.headers.authorization?.startsWith(
        "Bearer "
      )
    ) {
      token =
        req.headers.authorization.split(
          " "
        )[1];
    }

    // --------------------------------------------------
    // No token
    // --------------------------------------------------

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    // --------------------------------------------------
    // Verify JWT
    // --------------------------------------------------

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // --------------------------------------------------
    // Get user ID
    // --------------------------------------------------

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token",
      });
    }

    // --------------------------------------------------
    // Load current user from database
    // --------------------------------------------------
    //
    // This is important because accountStatus can
    // change after the JWT was issued.
    //
    // Password is never attached to req.user.
    // --------------------------------------------------

    const user =
      await User.findById(
        userId
      ).select(
        "-password"
      );

    // --------------------------------------------------
    // User no longer exists
    // --------------------------------------------------

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User not found",
      });
    }

    // --------------------------------------------------
    // SUSPENDED ACCOUNT
    // --------------------------------------------------
    //
    // A valid JWT does NOT override a suspension.
    // --------------------------------------------------

    if (
      user.accountStatus ===
      "suspended"
    ) {
      return res.status(403).json({
        success: false,
        code:
          "ACCOUNT_SUSPENDED",
        message:
          "Your account has been suspended by an administrator.",
      });
    }

    // --------------------------------------------------
    // Account active
    // --------------------------------------------------

    req.user =
      user;

    next();
  } catch (error) {
    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};

// ======================================================
// ADMIN ONLY
// ======================================================

export const adminOnly = (
  req,
  res,
  next
) => {
  if (
    !req.user
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication required",
    });
  }

  if (
    req.user.role !==
    "admin"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied",
    });
  }

  next();
};