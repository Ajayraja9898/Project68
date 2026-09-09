import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    // Real user ID is stored internally.
    // It is NEVER displayed publicly.
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Fresh anonymous identity for this post/session.
    anonymousName: {
      type: String,
      required: true,
      trim: true,
    },

    // Text content
    content: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    // Optional image
    imageUrl: {
      type: String,
      default: "",
    },

    // Community category
    category: {
      type: String,
      enum: [
        "General",
        "Academics",
        "Events",
        "Help",
        "Random",
      ],
      default: "General",
    },

    // Users who liked the post.
    // Their real IDs stay private.
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

const Post = mongoose.model("Post", postSchema);

export default Post;
