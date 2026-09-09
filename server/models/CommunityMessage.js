import mongoose from "mongoose";

const communityMessageSchema = new mongoose.Schema(
  {
    // ==========================================
    // REAL AUTHOR
    // ==========================================
    //
    // Stored internally for:
    // - administrator moderation
    // - abuse investigation
    // - account enforcement
    //
    // IMPORTANT:
    // This field must NEVER be returned by
    // student-facing community APIs.
    //
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // ANONYMOUS IDENTITY
    // ==========================================
    //
    // This is what students see publicly.
    //
    anonymousName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // ==========================================
    // MESSAGE
    // ==========================================

    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },

    // ==========================================
    // IMAGE
    // ==========================================

    imageUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    // ==========================================
    // REPLY
    // ==========================================

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityMessage",
      default: null,
    },

    // ==========================================
    // MESSAGE RETENTION
    // ==========================================

    retention: {
      type: String,
      enum: ["24h", "never"],
      default: "24h",
      required: true,
    },

    // ==========================================
    // EXPIRATION
    // ==========================================

    expiresAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // MODERATION
    // ==========================================

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedByAdmin: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // ADMIN THAT DELETED THE MESSAGE
    // ==========================================
    //
    // Optional audit information.
    //
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// RETENTION VALIDATION
// ==========================================
//
// 24h
//   -> expiresAt must exist
//
// never
//   -> expiresAt must be null
//
// ==========================================

communityMessageSchema.pre(
  "validate",
  function () {
    // ----------------------------------------
    // NEVER RETENTION
    // ----------------------------------------

    if (this.retention === "never") {
      this.expiresAt = null;
      return;
    }

    // ----------------------------------------
    // 24H RETENTION
    // ----------------------------------------

    if (
      this.retention === "24h" &&
      !this.expiresAt
    ) {
      this.expiresAt = new Date(
        Date.now() +
          24 *
            60 *
            60 *
            1000
      );
    }
  }
);

// ==========================================
// INDEXES
// ==========================================

// Author lookup for administrator moderation.

// Efficient message ordering.
communityMessageSchema.index({
  createdAt: -1,
});

// MongoDB TTL.
//
// expiresAt = null
//   -> not automatically deleted
//
// expiresAt = future date
//   -> automatically deleted after expiry
//
communityMessageSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

// ==========================================
// MODEL
// ==========================================
//
// Prevent model recompilation during
// development / nodemon / hot reload.
// ==========================================

const CommunityMessage =
  mongoose.models.CommunityMessage ||
  mongoose.model(
    "CommunityMessage",
    communityMessageSchema
  );

export default CommunityMessage;