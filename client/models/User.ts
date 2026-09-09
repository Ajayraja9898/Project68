import mongoose, {
  Schema,
  models,
} from "mongoose";

const UserSchema = new Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    // ==========================================
    // PROFILE
    // ==========================================

    department: {
      type: String,
      default: "",
    },

    year: {
      type: Number,
      default: 1,
    },

    bio: {
      type: String,
      default: "",
    },

    // ==========================================
    // PASSPORT / XP
    // ==========================================

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

    // ==========================================
    // ACHIEVEMENTS
    // ==========================================

    achievements: [
      {
        type: String,
      },
    ],

    // ==========================================
    // STATUS
    // ==========================================

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    // ==========================================
    // ROLE
    // ==========================================

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default models.User ||
  mongoose.model("User", UserSchema);