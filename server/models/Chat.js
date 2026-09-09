import mongoose from "mongoose";

const anonymousIdentitySchema = new mongoose.Schema(
  {
    // Real user ID is stored only internally.
    // It is NEVER returned to the other participant.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Anonymous name shown inside this chat.
    anonymousName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const chatSchema = new mongoose.Schema(
  {
    // ==========================================
    // Users in this chat
    // ==========================================

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // ==========================================
    // Anonymous identities
    // ==========================================
    //
    // Maps each real user to an anonymous identity.
    //
    // IMPORTANT:
    // This information is backend-only.
    // Never send the "user" field to the other
    // participant.
    //
    // Example:
    //
    // user A -> SilentFox482
    // user B -> MysticWolf731
    //
    // The real name and roll number are NOT stored
    // in this object.
    // ==========================================

    anonymousIdentities: [
      anonymousIdentitySchema,
    ],

    // ==========================================
    // Last message
    // ==========================================

    lastMessage: {
      type: String,
      default: "",
    },

    // ==========================================
    // Last sender
    // ==========================================

    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==========================================
    // Last activity
    // ==========================================

    lastActivity: {
      type: Date,
      default: Date.now,
    },

    // ==========================================
    // Anonymous chat
    // ==========================================

    isAnonymous: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // Chat status
    // ==========================================

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },

    // ==========================================
    // CHAT RETENTION
    // ==========================================
    //
    // keep
    // ----------------
    // Chat remains until manually closed/deleted.
    //
    // 24h
    // ----------------
    // Messages are treated as expired after
    // expiresAt.
    //
    // This setting belongs to the entire chat,
    // so both participants follow the same setting.
    // ==========================================

    retentionMode: {
      type: String,
      enum: ["keep", "24h"],
      default: "keep",
    },

    // ==========================================
    // CHAT EXPIRATION
    // ==========================================
    //
    // Only used when retentionMode === "24h".
    //
    // Example:
    //
    // created/activated:
    // 10:00 AM
    //
    // expiresAt:
    // next day 10:00 AM
    // ==========================================

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

// Efficient expiration lookup.
chatSchema.index({
  expiresAt: 1,
});

// Efficient participant lookup.
chatSchema.index({
  participants: 1,
});

// Efficient active-chat lookup.
chatSchema.index({
  participants: 1,
  status: 1,
});

// ==========================================
// MODEL
// ==========================================

const Chat = mongoose.model(
  "Chat",
  chatSchema
);

export default Chat;