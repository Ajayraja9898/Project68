import mongoose from "mongoose";

const userAchievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
      index: true,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
    },

    target: {
      type: Number,
      required: true,
      min: 1,
    },

    unlocked: {
      type: Boolean,
      default: false,
    },

    unlockedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userAchievementSchema.index(
  {
    user: 1,
    achievement: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "UserAchievement",
  userAchievementSchema
);
