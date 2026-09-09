import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // Post this reply belongs to
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    // Real user ID stored privately.
    // Never display this publicly.
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Anonymous name shown to everyone
    anonymousName: {
      type: String,
      required: true,
      trim: true,
    },

    // Reply text
    content: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },

    // Optional reply image
    imageUrl: {
      type: String,
      default: "",
    },

    // Users who liked this reply
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Admin moderation
    isRemoved: {
      type: Boolean,
      default: false,
    },

    removedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model(
  "Comment",
  commentSchema
);

export default Comment;
