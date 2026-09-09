import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // User who should receive the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // User who caused the notification
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "invite",
        "invite_accepted",
        "invite_declined",
        "message",
        "achievement",
        "system",
      ],
      required: true,
    },

    // Notification title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Notification message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional related object
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Whether the user has opened/read it
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Fast notification queries
notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipient: 1,
  isRead: 1,
});

export default mongoose.model(
  "Notification",
  notificationSchema
);