import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "🏆",
    },

    category: {
      type: String,
      enum: [
        "chat",
        "community",
        "passport",
        "social",
        "general",
      ],
      default: "general",
    },

    requirement: {
      type: Number,
      default: 1,
      min: 1,
    },

    points: {
      type: Number,
      default: 10,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Achievement",
  achievementSchema
);