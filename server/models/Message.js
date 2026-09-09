import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // ==========================================
    // Chat this message belongs to
    // ==========================================

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    // ==========================================
    // Sender
    // ==========================================

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // Receiver
    // ==========================================

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // Message content
    // ==========================================

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // Reply To
    // ==========================================

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // ==========================================
    // Seen status
    // ==========================================

    seen: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // Optional attachment
    // ==========================================

    attachment: {
      type: String,
      default: "",
    },

    // ==========================================
    // Deleted flag
    // ==========================================

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Automatically remove messages after 24h
// ONLY when their chat is configured for
// 24-hour deletion.
//
// We are NOT adding MongoDB TTL here because
// the setting belongs to the Chat.
// The controller/server will handle cleanup.
// ==========================================

messageSchema.index({
  chat: 1,
  createdAt: 1,
});

export default mongoose.model(
  "Message",
  messageSchema
);