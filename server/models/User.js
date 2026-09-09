import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // =========================
    // Basic Information
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    rollNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      type: String,
      default: "",
    },

    // =========================
    // Roles
    // =========================
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    // =========================
    // Profile
    // =========================
    bio: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "Computer Science",
    },

    year: {
      type: Number,
      default: 3,
    },

    gender: {
      type: String,
      default: "",
    },

    // =========================
    // Online Status
    // =========================
    isOnline: {
      type: Boolean,
      default: false,
    },

    isAvailableForPartner: {
      type: Boolean,
      default: true,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    // =========================
    // Passport
    // =========================
    xp: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },

    streak: {
      type: Number,
      default: 0,
    },

    // =========================
    // Achievements
    // =========================
    achievements: [
      {
        type: String,
      },
    ],

    // =========================
    // Friends
    // =========================
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // =========================
    // Blocked Users
    // =========================
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // =========================
    // Notifications
    // =========================
    notifications: [
      {
        title: String,
        message: String,

        read: {
          type: Boolean,
          default: false,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // =========================
    // Account
    // =========================
    isVerified: {
      type: Boolean,
      default: true,
    },

    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);