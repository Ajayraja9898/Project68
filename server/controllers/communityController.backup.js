import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import CommunityMessage from "../models/CommunityMessage.js";

// ======================================================
// Generate Anonymous Name
// ======================================================

function generateAnonymousName() {
  const adjectives = [
    "Silent",
    "Hidden",
    "Mystic",
    "Shadow",
    "Blue",
    "Swift",
    "Lucky",
    "Quiet",
    "Brave",
    "Clever",
    "Cosmic",
    "Secret",
    "Calm",
    "Wild",
    "Happy",
  ];

  const animals = [
    "Fox",
    "Wolf",
    "Tiger",
    "Eagle",
    "Panda",
    "Lion",
    "Owl",
    "Falcon",
    "Bear",
    "Rabbit",
    "Dolphin",
    "Dragon",
    "Cat",
    "Hawk",
    "Penguin",
  ];

  const adjective =
    adjectives[
      Math.floor(
        Math.random() * adjectives.length
      )
    ];

  const animal =
    animals[
      Math.floor(
        Math.random() * animals.length
      )
    ];

  const number =
    Math.floor(Math.random() * 900) + 100;

  return `${adjective}${animal}${number}`;
}

// ======================================================
// COMMUNITY POSTS
// ======================================================

// ======================================================
// Get Community Posts
// ======================================================

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      isRemoved: false,
    })
      .populate("author", "_id")
      .sort({
        createdAt: -1,
      });

    const safePosts = posts.map((post) => ({
      _id: post._id,
      anonymousName: post.anonymousName,
      content: post.content,
      imageUrl: post.imageUrl,
      category: post.category,
      likes: post.likes.length,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: safePosts.length,
      posts: safePosts,
    });
  } catch (error) {
    console.log(
      "GET COMMUNITY POSTS ERROR"
    );
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================================
// Create Community Post
// ======================================================

export const createPost = async (req, res) => {
  try {
    const {
      content,
      imageUrl,
      category,
    } = req.body;

    if (
      (!content || !content.trim()) &&
      !imageUrl
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Post must contain text or an image",
      });
    }

    const post = await Post.create({
      author: req.user._id,

      anonymousName:
        generateAnonymousName(),

      content:
        content?.trim() || "",

      imageUrl:
        imageUrl || "",

      category:
        category || "General",
    });

    return res.status(201).json({
      success: true,
      message:
        "Post created successfully",

      post: {
        _id: post._id,
        anonymousName:
          post.anonymousName,
        content:
          post.content,
        imageUrl:
          post.imageUrl,
        category:
          post.category,
        likes: 0,
        createdAt:
          post.createdAt,
      },
    });
  } catch (error) {
    console.log(
      "CREATE COMMUNITY POST ERROR"
    );
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================================
// COMMUNITY COMMENTS
// ======================================================

// ======================================================
// Get Comments For Post
// ======================================================

export const getComments = async (
  req,
  res
) => {
  try {
    const { postId } = req.params;

    const comments =
      await Comment.find({
        post: postId,
        isRemoved: false,
      }).sort({
        createdAt: 1,
      });

    const safeComments =
      comments.map((comment) => ({
        _id: comment._id,

        anonymousName:
          comment.anonymousName,

        content:
          comment.content,

        imageUrl:
          comment.imageUrl,

        likes:
          comment.likes.length,

        createdAt:
          comment.createdAt,

        updatedAt:
          comment.updatedAt,
      }));

    return res.status(200).json({
      success: true,
      count:
        safeComments.length,
      comments:
        safeComments,
    });
  } catch (error) {
    console.log(
      "GET COMMUNITY COMMENTS ERROR"
    );
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================================
// Create Anonymous Comment
// ======================================================

export const createComment = async (
  req,
  res
) => {
  try {
    const { postId } =
      req.params;

    const {
      content,
      imageUrl,
    } = req.body;

    if (
      (!content || !content.trim()) &&
      !imageUrl
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reply must contain text or an image",
      });
    }

    const post =
      await Post.findById(postId);

    if (
      !post ||
      post.isRemoved
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Post not found",
      });
    }

    const comment =
      await Comment.create({
        post: postId,

        author:
          req.user._id,

        anonymousName:
          generateAnonymousName(),

        content:
          content?.trim() || "",

        imageUrl:
          imageUrl || "",
      });

    return res.status(201).json({
      success: true,
      message:
        "Reply added successfully",

      comment: {
        _id:
          comment._id,

        anonymousName:
          comment.anonymousName,

        content:
          comment.content,

        imageUrl:
          comment.imageUrl,

        likes: 0,

        createdAt:
          comment.createdAt,
      },
    });
  } catch (error) {
    console.log(
      "CREATE COMMUNITY COMMENT ERROR"
    );
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================================
// Like / Unlike Post
// ======================================================

export const togglePostLike =
  async (req, res) => {
    try {
      const { postId } =
        req.params;

      const post =
        await Post.findById(
          postId
        );

      if (
        !post ||
        post.isRemoved
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Post not found",
        });
      }

      const userId =
        req.user._id.toString();

      const alreadyLiked =
        post.likes.some(
          (id) =>
            id.toString() ===
            userId
        );

      if (alreadyLiked) {
        post.likes =
          post.likes.filter(
            (id) =>
              id.toString() !==
              userId
          );
      } else {
        post.likes.push(
          req.user._id
        );
      }

      await post.save();

      return res.status(200).json({
        success: true,
        liked:
          !alreadyLiked,
        likes:
          post.likes.length,
      });
    } catch (error) {
      console.log(
        "POST LIKE ERROR"
      );
      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };

// ======================================================
// Like / Unlike Comment
// ======================================================

export const toggleCommentLike =
  async (req, res) => {
    try {
      const { commentId } =
        req.params;

      const comment =
        await Comment.findById(
          commentId
        );

      if (
        !comment ||
        comment.isRemoved
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Comment not found",
        });
      }

      const userId =
        req.user._id.toString();

      const alreadyLiked =
        comment.likes.some(
          (id) =>
            id.toString() ===
            userId
        );

      if (alreadyLiked) {
        comment.likes =
          comment.likes.filter(
            (id) =>
              id.toString() !==
              userId
          );
      } else {
        comment.likes.push(
          req.user._id
        );
      }

      await comment.save();

      return res.status(200).json({
        success: true,
        liked:
          !alreadyLiked,
        likes:
          comment.likes.length,
      });
    } catch (error) {
      console.log(
        "COMMENT LIKE ERROR"
      );
      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };

// ======================================================
// Delete Own Post
// ======================================================

export const deleteOwnPost =
  async (req, res) => {
    try {
      const { postId } =
        req.params;

      const post =
        await Post.findById(
          postId
        );

      if (!post) {
        return res.status(404).json({
          success: false,
          message:
            "Post not found",
        });
      }

      if (
        post.author.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot delete this post",
        });
      }

      post.isRemoved = true;
      post.removedByAdmin = null;

      await post.save();

      return res.status(200).json({
        success: true,
        message:
          "Post removed successfully",
      });
    } catch (error) {
      console.log(
        "DELETE OWN POST ERROR"
      );
      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };

// ======================================================
// Delete Own Comment
// ======================================================

export const deleteOwnComment =
  async (req, res) => {
    try {
      const { commentId } =
        req.params;

      const comment =
        await Comment.findById(
          commentId
        );

      if (!comment) {
        return res.status(404).json({
          success: false,
          message:
            "Comment not found",
        });
      }

      if (
        comment.author.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot delete this comment",
        });
      }

      comment.isRemoved = true;

      await comment.save();

      return res.status(200).json({
        success: true,
        message:
          "Comment removed successfully",
      });
    } catch (error) {
      console.log(
        "DELETE OWN COMMENT ERROR"
      );
      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };

// ======================================================
// COMMUNITY CHAT
// ======================================================

// ======================================================
// Get Community Chat Messages
// ======================================================

export const getCommunityMessages =
  async (req, res) => {
    try {
      /*
       * Get the latest 200 messages.
       *
       * We fetch newest first so MongoDB can efficiently
       * retrieve the latest messages, then reverse them
       * before returning so the frontend receives them
       * in normal chat order.
       */

      const messages =
        await CommunityMessage.find({
          isDeleted: false,
        })
          .populate(
            "replyTo",
            "anonymousName message imageUrl createdAt"
          )
          .sort({
            createdAt: -1,
          })
          .limit(200)
          .lean();

      const orderedMessages =
        messages.reverse();

      return res.status(200).json({
        success: true,
        count:
          orderedMessages.length,
        messages:
          orderedMessages,
      });
    } catch (error) {
      console.log(
        "GET COMMUNITY CHAT ERROR"
      );
      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to load community chat",
      });
    }
  };

// ======================================================
// Send Community Chat Message
// ======================================================

export const sendCommunityMessage =
  async (req, res) => {
    try {
      const {
        anonymousName,
        message,
        imageUrl,
        replyTo,
      } = req.body;

      /*
       * Validate anonymous name.
       */

      if (
        !anonymousName ||
        !anonymousName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Anonymous name is required",
        });
      }

      /*
       * Validate message content.
       *
       * Either text or image is required.
       */

      const cleanMessage =
        message?.trim() || "";

      const cleanImageUrl =
        imageUrl?.trim() || "";

      if (
        !cleanMessage &&
        !cleanImageUrl
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message or image is required",
        });
      }

      /*
       * Validate replyTo if supplied.
       */

      let validReplyTo = null;

      if (replyTo) {
        const replyMessage =
          await CommunityMessage.findOne({
            _id: replyTo,
            isDeleted: false,
          });

        if (!replyMessage) {
          return res.status(400).json({
            success: false,
            message:
              "Reply message not found",
          });
        }

        validReplyTo =
          replyMessage._id;
      }

      /*
       * Create message.
       */

      const newMessage =
        await CommunityMessage.create({
          anonymousName:
            anonymousName.trim(),

          message:
            cleanMessage,

          imageUrl:
            cleanImageUrl,

          replyTo:
            validReplyTo,
        });

      /*
       * Populate reply information.
       */

      const populatedMessage =
        await CommunityMessage.findById(
          newMessage._id
        )
          .populate(
            "replyTo",
            "anonymousName message imageUrl createdAt"
          )
          .lean();

      console.log(
        "💾 COMMUNITY MESSAGE SAVED:",
        populatedMessage?._id
      );

      return res.status(201).json({
        success: true,
        message:
          populatedMessage,
      });
    } catch (error) {
      console.log(
        "SEND COMMUNITY CHAT ERROR"
      );
      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to send community message",
      });
    }
  };

// ======================================================
// Delete Community Chat Message
// ======================================================

export const deleteCommunityMessage =
  async (req, res) => {
    try {
      const { messageId } =
        req.params;

      const message =
        await CommunityMessage.findById(
          messageId
        );

      if (!message) {
        return res.status(404).json({
          success: false,
          message:
            "Message not found",
        });
      }

      /*
       * Soft delete.
       *
       * We don't physically remove the document
       * from MongoDB. This gives us the ability to
       * implement moderation/audit features later.
       */

      message.isDeleted = true;
      message.deletedByAdmin = true;

      await message.save();

      console.log(
        "🗑️ COMMUNITY MESSAGE DELETED:",
        messageId
      );

      return res.status(200).json({
        success: true,
        message:
          "Community message deleted",
      });
    } catch (error) {
      console.log(
        "DELETE COMMUNITY CHAT ERROR"
      );
      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete community message",
      });
    }
  };