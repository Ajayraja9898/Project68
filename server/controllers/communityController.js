import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import CommunityMessage from "../models/CommunityMessage.js";

import {
  updateAchievementProgress,
} from "../services/achievementService.js";

// ======================================================
// GENERATE ANONYMOUS NAME
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
        Math.random() *
          adjectives.length
      )
    ];

  const animal =
    animals[
      Math.floor(
        Math.random() *
          animals.length
      )
    ];

  const number =
    Math.floor(
      Math.random() *
        900
    ) + 100;

  return `${adjective}${animal}${number}`;
}

// ======================================================
// HELPERS
// ======================================================

function cleanString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(
    String(id || "")
  );
}

// ======================================================
// ADMIN CHECK
// ======================================================

function isAdmin(req) {
  return (
    req.user &&
    String(
      req.user.role || ""
    ).toLowerCase() ===
      "admin"
  );
}

// ======================================================
// COMMUNITY POSTS
// ======================================================

// ======================================================
// GET COMMUNITY POSTS
// ======================================================

export const getPosts = async (
  req,
  res
) => {
  try {
    const posts =
      await Post.find({
        isRemoved: false,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    const safePosts =
      posts.map(
        (post) => ({
          _id:
            post._id,

          anonymousName:
            post.anonymousName,

          content:
            post.content || "",

          imageUrl:
            post.imageUrl || "",

          category:
            post.category ||
            "General",

          likes:
            Array.isArray(
              post.likes
            )
              ? post.likes.length
              : 0,

          createdAt:
            post.createdAt,

          updatedAt:
            post.updatedAt,
        })
      );

    return res.status(200).json({
      success: true,
      count:
        safePosts.length,
      posts:
        safePosts,
    });
  } catch (error) {
    console.error(
      "🔥 GET COMMUNITY POSTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load community posts",
    });
  }
};

// ======================================================
// CREATE COMMUNITY POST
// ======================================================

export const createPost =
  async (
    req,
    res
  ) => {
    try {
      const content =
        cleanString(
          req.body?.content
        );

      const imageUrl =
        cleanString(
          req.body?.imageUrl
        );

      const category =
        cleanString(
          req.body?.category
        ) ||
        "General";

      if (
        !content &&
        !imageUrl
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Post must contain text or an image",
        });
      }

      const post =
        await Post.create({
          author:
            req.user._id,

          anonymousName:
            generateAnonymousName(),

          content,

          imageUrl,

          category,
        });

      return res.status(201).json({
        success:
          true,

        message:
          "Post created successfully",

        post: {
          _id:
            post._id,

          anonymousName:
            post.anonymousName,

          content:
            post.content,

          imageUrl:
            post.imageUrl,

          category:
            post.category,

          likes:
            0,

          createdAt:
            post.createdAt,

          updatedAt:
            post.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "🔥 CREATE COMMUNITY POST ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to create post",
      });
    }
  };

// ======================================================
// COMMUNITY COMMENTS
// ======================================================

// ======================================================
// GET COMMENTS FOR POST
// ======================================================

export const getComments =
  async (
    req,
    res
  ) => {
    try {
      const {
        postId,
      } = req.params;

      if (
        !isValidObjectId(
          postId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid post ID",
        });
      }

      const post =
        await Post.findOne({
          _id:
            postId,

          isRemoved:
            false,
        });

      if (!post) {
        return res.status(404).json({
          success:
            false,

          message:
            "Post not found",
        });
      }

      const comments =
        await Comment.find({
          post:
            postId,

          isRemoved:
            false,
        })
          .sort({
            createdAt:
              1,
          })
          .lean();

      const safeComments =
        comments.map(
          (comment) => ({
            _id:
              comment._id,

            anonymousName:
              comment.anonymousName,

            content:
              comment.content ||
              "",

            imageUrl:
              comment.imageUrl ||
              "",

            likes:
              Array.isArray(
                comment.likes
              )
                ? comment.likes.length
                : 0,

            createdAt:
              comment.createdAt,

            updatedAt:
              comment.updatedAt,
          })
        );

      return res.status(200).json({
        success:
          true,

        count:
          safeComments.length,

        comments:
          safeComments,
      });
    } catch (error) {
      console.error(
        "🔥 GET COMMUNITY COMMENTS ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to load comments",
      });
    }
  };

// ======================================================
// CREATE ANONYMOUS COMMENT
// ======================================================

export const createComment =
  async (
    req,
    res
  ) => {
    try {
      const {
        postId,
      } = req.params;

      if (
        !isValidObjectId(
          postId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid post ID",
        });
      }

      const content =
        cleanString(
          req.body?.content
        );

      const imageUrl =
        cleanString(
          req.body?.imageUrl
        );

      if (
        !content &&
        !imageUrl
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Reply must contain text or an image",
        });
      }

      const post =
        await Post.findOne({
          _id:
            postId,

          isRemoved:
            false,
        });

      if (!post) {
        return res.status(404).json({
          success:
            false,

          message:
            "Post not found",
        });
      }

      const comment =
        await Comment.create({
          post:
            postId,

          author:
            req.user._id,

          anonymousName:
            generateAnonymousName(),

          content,

          imageUrl,
        });

      return res.status(201).json({
        success:
          true,

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

          likes:
            0,

          createdAt:
            comment.createdAt,

          updatedAt:
            comment.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "🔥 CREATE COMMUNITY COMMENT ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to create comment",
      });
    }
  };

// ======================================================
// LIKE / UNLIKE POST
// ======================================================

export const togglePostLike =
  async (
    req,
    res
  ) => {
    try {
      const {
        postId,
      } = req.params;

      if (
        !isValidObjectId(
          postId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid post ID",
        });
      }

      const post =
        await Post.findOne({
          _id:
            postId,

          isRemoved:
            false,
        });

      if (!post) {
        return res.status(404).json({
          success:
            false,

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

      if (
        alreadyLiked
      ) {
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
        success:
          true,

        liked:
          !alreadyLiked,

        likes:
          post.likes.length,
      });
    } catch (error) {
      console.error(
        "🔥 POST LIKE ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to update post like",
      });
    }
  };

// ======================================================
// LIKE / UNLIKE COMMENT
// ======================================================

export const toggleCommentLike =
  async (
    req,
    res
  ) => {
    try {
      const {
        commentId,
      } = req.params;

      if (
        !isValidObjectId(
          commentId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid comment ID",
        });
      }

      const comment =
        await Comment.findOne({
          _id:
            commentId,

          isRemoved:
            false,
        });

      if (!comment) {
        return res.status(404).json({
          success:
            false,

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

      if (
        alreadyLiked
      ) {
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
        success:
          true,

        liked:
          !alreadyLiked,

        likes:
          comment.likes.length,
      });
    } catch (error) {
      console.error(
        "🔥 COMMENT LIKE ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to update comment like",
      });
    }
  };

// ======================================================
// DELETE OWN POST
// ======================================================

export const deleteOwnPost =
  async (
    req,
    res
  ) => {
    try {
      const {
        postId,
      } = req.params;

      if (
        !isValidObjectId(
          postId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid post ID",
        });
      }

      const post =
        await Post.findById(
          postId
        );

      if (!post) {
        return res.status(404).json({
          success:
            false,

          message:
            "Post not found",
        });
      }

      if (
        post.author.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "You cannot delete this post",
        });
      }

      post.isRemoved =
        true;

      post.removedByAdmin =
        null;

      await post.save();

      return res.status(200).json({
        success:
          true,

        message:
          "Post removed successfully",
      });
    } catch (error) {
      console.error(
        "🔥 DELETE OWN POST ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to remove post",
      });
    }
  };

// ======================================================
// DELETE OWN COMMENT
// ======================================================

export const deleteOwnComment =
  async (
    req,
    res
  ) => {
    try {
      const {
        commentId,
      } = req.params;

      if (
        !isValidObjectId(
          commentId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid comment ID",
        });
      }

      const comment =
        await Comment.findById(
          commentId
        );

      if (!comment) {
        return res.status(404).json({
          success:
            false,

          message:
            "Comment not found",
        });
      }

      if (
        comment.author.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "You cannot delete this comment",
        });
      }

      comment.isRemoved =
        true;

      await comment.save();

      return res.status(200).json({
        success:
          true,

        message:
          "Comment removed successfully",
      });
    } catch (error) {
      console.error(
        "🔥 DELETE OWN COMMENT ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to delete comment",
      });
    }
  };

// ======================================================
// COMMUNITY CHAT
// ======================================================

// ======================================================
// GET COMMUNITY CHAT MESSAGES
// ======================================================
//
// STUDENT-FACING ENDPOINT
//
// Never returns:
// - author
// - real name
// - roll number
// ======================================================

export const getCommunityMessages =
  async (
    req,
    res
  ) => {
    try {
      const now =
        new Date();

      const messages =
        await CommunityMessage.find({
          isDeleted:
            false,

          $or: [
            {
              expiresAt:
                null,
            },

            {
              expiresAt: {
                $gt:
                  now,
              },
            },
          ],
        })
          .populate(
            "replyTo",
            "anonymousName message imageUrl createdAt retention expiresAt isDeleted"
          )
          .sort({
            createdAt:
              -1,
          })
          .limit(200)
          .lean();

      const safeMessages =
        messages.map(
          (item) => {
            let safeReply =
              null;

            if (
              item.replyTo &&
              !item.replyTo.isDeleted
            ) {
              const replyExpired =
                item.replyTo.expiresAt &&
                new Date(
                  item.replyTo.expiresAt
                ).getTime() <=
                  now.getTime();

              if (
                !replyExpired
              ) {
                safeReply = {
                  _id:
                    item.replyTo._id,

                  anonymousName:
                    item
                      .replyTo
                      .anonymousName,

                  message:
                    item
                      .replyTo
                      .message ||
                    "",

                  imageUrl:
                    item
                      .replyTo
                      .imageUrl ||
                    "",

                  createdAt:
                    item
                      .replyTo
                      .createdAt,

                  retention:
                    item
                      .replyTo
                      .retention,

                  expiresAt:
                    item
                      .replyTo
                      .expiresAt,
                };
              }
            }

            return {
              _id:
                item._id,
            
              anonymousName:
                item.anonymousName,
            
              // TRUE if this message belongs to the logged-in user
              isMine:
                item.author &&
                item.author.toString() ===
                  req.user._id.toString(),
            
              message:
                item.message ||
                "",

              imageUrl:
                item.imageUrl ||
                "",

              replyTo:
                safeReply,

              retention:
                item.retention ===
                "never"
                  ? "never"
                  : "24h",

              expiresAt:
                item.expiresAt ||
                null,

              isDeleted:
                Boolean(
                  item.isDeleted
                ),

              deletedByAdmin:
                Boolean(
                  item.deletedByAdmin
                ),

              createdAt:
                item.createdAt,

              updatedAt:
                item.updatedAt,
            };
          }
        );

      safeMessages.reverse();

      return res.status(200).json({
        success:
          true,

        count:
          safeMessages.length,

        messages:
          safeMessages,
      });
    } catch (error) {
      console.error(
        "🔥 GET COMMUNITY CHAT ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to load community chat",
      });
    }
  };

// ======================================================
// SEND COMMUNITY CHAT MESSAGE
// ======================================================
//
// IMPORTANT:
//
// The frontend no longer controls anonymousName.
//
// The server generates the anonymous identity.
//
// The authenticated user is saved internally as
// `author`.
//
// Students never receive `author`.
// ======================================================

export const sendCommunityMessage =
  async (
    req,
    res
  ) => {
    try {
      // ==================================================
      // VALIDATE AUTHENTICATION
      // ==================================================

      if (
        !req.user ||
        !req.user._id
      ) {
        return res.status(401).json({
          success:
            false,

          message:
            "Authentication required",
        });
      }

      // ==================================================
      // INPUT
      // ==================================================

      const message =
        cleanString(
          req.body?.message
        );

      const imageUrl =
        cleanString(
          req.body?.imageUrl
        );

      const replyTo =
        req.body?.replyTo ||
        null;

      // ==================================================
      // RETENTION
      // ==================================================

      const selectedRetention =
        req.body?.retention ===
        "never"
          ? "never"
          : "24h";

      // ==================================================
      // VALIDATE CONTENT
      // ==================================================

      if (
        !message &&
        !imageUrl
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Message or image is required",
        });
      }

      // ==================================================
      // GENERATE ANONYMOUS NAME SERVER-SIDE
      // ==================================================

      const anonymousName =
        generateAnonymousName();

      // ==================================================
      // EXPIRATION
      // ==================================================

      const expiresAt =
        selectedRetention ===
        "24h"
          ? new Date(
              Date.now() +
                24 *
                  60 *
                  60 *
                  1000
            )
          : null;

      // ==================================================
      // VALIDATE REPLY
      // ==================================================

      let validReplyTo =
        null;

      if (replyTo) {
        if (
          !isValidObjectId(
            replyTo
          )
        ) {
          return res.status(400).json({
            success:
              false,

            message:
              "Invalid reply message ID",
          });
        }

        const replyMessage =
          await CommunityMessage.findOne(
            {
              _id:
                replyTo,

              isDeleted:
                false,

              $or: [
                {
                  expiresAt:
                    null,
                },

                {
                  expiresAt: {
                    $gt:
                      new Date(),
                  },
                },
              ],
            }
          );

        if (
          !replyMessage
        ) {
          return res.status(400).json({
            success:
              false,

            message:
              "Reply message not found or expired",
          });
        }

        validReplyTo =
          replyMessage._id;
      }

      // ==================================================
      // CREATE COMMUNITY MESSAGE
      // ==================================================

      const newMessage =
        await CommunityMessage.create({
          author:
            req.user._id,

          anonymousName:
            anonymousName,

          message:
            message,

          imageUrl:
            imageUrl,

          replyTo:
            validReplyTo,

          retention:
            selectedRetention,

          expiresAt:
            expiresAt,

          isDeleted:
            false,

          deletedByAdmin:
            false,

          deletedBy:
            null,
        });

      // ==================================================
      // ACHIEVEMENT PROGRESS
      // ==================================================
      //
      // Community Starter -> 1
      // Community Voice    -> 10
      // Community Regular  -> 50
      //
      // Achievement errors must never prevent the
      // community message from being delivered.
      // ==================================================

      try {
        const unlockedAchievements =
          await updateAchievementProgress(
            req.user._id,
            "community",
            1
          );

        if (
          unlockedAchievements.length >
          0
        ) {
          console.log(
            "🏆 COMMUNITY ACHIEVEMENTS UNLOCKED:",
            unlockedAchievements.map(
              (
                achievement
              ) =>
                achievement.name
            )
          );
        }
      } catch (
        achievementError
      ) {
        console.error(
          "⚠️ COMMUNITY ACHIEVEMENT ERROR:",
          achievementError
        );
      }

      // ==================================================
      // POPULATE REPLY
      // ==================================================

      const populatedMessage =
        await CommunityMessage.findById(
          newMessage._id
        )
          .populate(
            "replyTo",
            "anonymousName message imageUrl createdAt retention expiresAt isDeleted"
          )
          .lean();

      if (
        !populatedMessage
      ) {
        return res.status(500).json({
          success:
            false,

          message:
            "Unable to create community message",
        });
      }

      // ==================================================
      // SAFE REPLY
      // ==================================================

      let safeReply =
        null;

      if (
        populatedMessage.replyTo &&
        !populatedMessage
          .replyTo
          .isDeleted
      ) {
        const replyExpired =
          populatedMessage
            .replyTo
            .expiresAt &&
          new Date(
            populatedMessage
              .replyTo
              .expiresAt
          ).getTime() <=
            Date.now();

        if (
          !replyExpired
        ) {
          safeReply = {
            _id:
              populatedMessage
                .replyTo
                ._id,

            anonymousName:
              populatedMessage
                .replyTo
                .anonymousName,

            message:
              populatedMessage
                .replyTo
                .message ||
              "",

            imageUrl:
              populatedMessage
                .replyTo
                .imageUrl ||
              "",

            createdAt:
              populatedMessage
                .replyTo
                .createdAt,

            retention:
              populatedMessage
                .replyTo
                .retention,

            expiresAt:
              populatedMessage
                .replyTo
                .expiresAt,
          };
        }
      }

      // ==================================================
      // SAFE RESPONSE
      // ==================================================

      const responseMessage = {
        _id:
          populatedMessage._id,

        anonymousName:
          populatedMessage
            .anonymousName,

        message:
          populatedMessage
            .message ||
          "",

        imageUrl:
          populatedMessage
            .imageUrl ||
          "",

        replyTo:
          safeReply,

        retention:
          populatedMessage
            .retention,

        expiresAt:
          populatedMessage
            .expiresAt ||
          null,

        isDeleted:
          false,

        deletedByAdmin:
          false,

        createdAt:
          populatedMessage
            .createdAt,

        updatedAt:
          populatedMessage
            .updatedAt,
      };

      // ==================================================
      // SERVER LOG
      // ==================================================

      console.log(
        "💾 COMMUNITY MESSAGE SAVED:",
        {
          id:
            responseMessage
              ._id,

          author:
            req.user
              ._id,

          anonymousName:
            responseMessage
              .anonymousName,

          retention:
            responseMessage
              .retention,

          expiresAt:
            responseMessage
              .expiresAt,
        }
      );

      return res.status(201).json({
        success:
          true,

        message:
          responseMessage,
      });
    } catch (error) {
      console.error(
        "🔥 SEND COMMUNITY CHAT ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to send community message",
      });
    }
  };

// ======================================================
// DELETE COMMUNITY CHAT MESSAGE
// ======================================================
//
// ADMIN ONLY
// ======================================================

export const deleteCommunityMessage =
  async (
    req,
    res
  ) => {
    try {
      if (
        !isAdmin(req)
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Administrator access required",
        });
      }

      const {
        messageId,
      } = req.params;

      if (
        !isValidObjectId(
          messageId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid message ID",
        });
      }

      const message =
        await CommunityMessage.findById(
          messageId
        );

      if (!message) {
        return res.status(404).json({
          success:
            false,

          message:
            "Message not found",
        });
      }

      if (
        message.isDeleted
      ) {
        return res.status(200).json({
          success:
            true,

          message:
            "Message already deleted",
        });
      }

      message.isDeleted =
        true;

      message.deletedByAdmin =
        true;

      message.deletedBy =
        req.user._id;

      await message.save();

      console.log(
        "🛡️ ADMIN DELETED COMMUNITY MESSAGE:",
        {
          messageId,

          adminId:
            req.user?._id,
        }
      );

      return res.status(200).json({
        success:
          true,

        message:
          "Community message deleted",
      });
    } catch (error) {
      console.error(
        "🔥 DELETE COMMUNITY CHAT ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to delete community message",
      });
    }
  };

// ======================================================
// ADMIN: GET ALL COMMUNITY POSTS
// ======================================================

export const getAdminCommunityPosts =
  async (
    req,
    res
  ) => {
    try {
      if (
        !isAdmin(req)
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Administrator access required",
        });
      }

      const posts =
        await Post.find({})
          .populate(
            "author",
            "_id name rollNumber role department year"
          )
          .populate(
            "removedByAdmin",
            "_id name rollNumber"
          )
          .sort({
            createdAt:
              -1,
          })
          .lean();

      const safePosts =
        posts.map(
          (post) => ({
            _id:
              post._id,

            anonymousName:
              post.anonymousName,

            content:
              post.content ||
              "",

            imageUrl:
              post.imageUrl ||
              "",

            category:
              post.category ||
              "General",

            likes:
              Array.isArray(
                post.likes
              )
                ? post.likes.length
                : 0,

            isRemoved:
              Boolean(
                post.isRemoved
              ),

            removedByAdmin:
              post.removedByAdmin ||
              null,

            author:
              post.author ||
              null,

            createdAt:
              post.createdAt,

            updatedAt:
              post.updatedAt,
          })
        );

      return res.status(200).json({
        success:
          true,

        count:
          safePosts.length,

        posts:
          safePosts,
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN COMMUNITY POSTS ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to load community posts for moderation",
      });
    }
  };

// ======================================================
// ADMIN: REMOVE ANY POST
// ======================================================

export const adminRemovePost =
  async (
    req,
    res
  ) => {
    try {
      if (
        !isAdmin(req)
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Administrator access required",
        });
      }

      const {
        postId,
      } = req.params;

      if (
        !isValidObjectId(
          postId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid post ID",
        });
      }

      const post =
        await Post.findById(
          postId
        );

      if (!post) {
        return res.status(404).json({
          success:
            false,

          message:
            "Post not found",
        });
      }

      if (
        post.isRemoved
      ) {
        return res.status(200).json({
          success:
            true,

          message:
            "Post is already removed",
        });
      }

      post.isRemoved =
        true;

      post.removedByAdmin =
        req.user._id;

      await post.save();

      console.log(
        "🛡️ ADMIN REMOVED POST:",
        {
          postId,

          adminId:
            req.user._id,
        }
      );

      return res.status(200).json({
        success:
          true,

        message:
          "Post removed by administrator",
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN REMOVE POST ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to remove post",
      });
    }
  };

// ======================================================
// ADMIN: RESTORE POST
// ======================================================

export const adminRestorePost =
  async (
    req,
    res
  ) => {
    try {
      if (
        !isAdmin(req)
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Administrator access required",
        });
      }

      const {
        postId,
      } = req.params;

      if (
        !isValidObjectId(
          postId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid post ID",
        });
      }

      const post =
        await Post.findById(
          postId
        );

      if (!post) {
        return res.status(404).json({
          success:
            false,

          message:
            "Post not found",
        });
      }

      post.isRemoved =
        false;

      post.removedByAdmin =
        null;

      await post.save();

      console.log(
        "🛡️ ADMIN RESTORED POST:",
        {
          postId,

          adminId:
            req.user._id,
        }
      );

      return res.status(200).json({
        success:
          true,

        message:
          "Post restored successfully",
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN RESTORE POST ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to restore post",
      });
    }
  };

// ======================================================
// ADMIN: GET ALL COMMUNITY COMMENTS
// ======================================================

export const getAdminCommunityComments =
  async (
    req,
    res
  ) => {
    try {
      if (
        !isAdmin(req)
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Administrator access required",
        });
      }

      const comments =
        await Comment.find({})
          .populate(
            "author",
            "_id name rollNumber role department year"
          )
          .populate(
            "removedByAdmin",
            "_id name rollNumber"
          )
          .populate(
            "post",
            "_id anonymousName content"
          )
          .sort({
            createdAt:
              -1,
          })
          .lean();

      const safeComments =
        comments.map(
          (comment) => ({
            _id:
              comment._id,

            anonymousName:
              comment.anonymousName,

            content:
              comment.content ||
              "",

            imageUrl:
              comment.imageUrl ||
              "",

            likes:
              Array.isArray(
                comment.likes
              )
                ? comment.likes.length
                : 0,

            isRemoved:
              Boolean(
                comment.isRemoved
              ),

            removedByAdmin:
              comment.removedByAdmin ||
              null,

            author:
              comment.author ||
              null,

            post:
              comment.post ||
              null,

            createdAt:
              comment.createdAt,

            updatedAt:
              comment.updatedAt,
          })
        );

      return res.status(200).json({
        success:
          true,

        count:
          safeComments.length,

        comments:
          safeComments,
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN COMMUNITY COMMENTS ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to load community comments for moderation",
      });
    }
  };

// ======================================================
// ADMIN: REMOVE ANY COMMENT
// ======================================================

export const adminRemoveComment =
  async (
    req,
    res
  ) => {
    try {
      if (
        !isAdmin(req)
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Administrator access required",
        });
      }

      const {
        commentId,
      } = req.params;

      if (
        !isValidObjectId(
          commentId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid comment ID",
        });
      }

      const comment =
        await Comment.findById(
          commentId
        );

      if (!comment) {
        return res.status(404).json({
          success:
            false,

          message:
            "Comment not found",
        });
      }

      if (
        comment.isRemoved
      ) {
        return res.status(200).json({
          success:
            true,

          message:
            "Comment is already removed",
        });
      }

      comment.isRemoved =
        true;

      comment.removedByAdmin =
        req.user._id;

      await comment.save();

      console.log(
        "🛡️ ADMIN REMOVED COMMENT:",
        {
          commentId,

          adminId:
            req.user._id,
        }
      );

      return res.status(200).json({
        success:
          true,

        message:
          "Comment removed by administrator",
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN REMOVE COMMENT ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to remove comment",
      });
    }
  };

// ======================================================
// ADMIN: RESTORE COMMENT
// ======================================================

export const adminRestoreComment =
  async (
    req,
    res
  ) => {
    try {
      if (
        !isAdmin(req)
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Administrator access required",
        });
      }

      const {
        commentId,
      } = req.params;

      if (
        !isValidObjectId(
          commentId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid comment ID",
        });
      }

      const comment =
        await Comment.findById(
          commentId
        );

      if (!comment) {
        return res.status(404).json({
          success:
            false,

          message:
            "Comment not found",
        });
      }

      comment.isRemoved =
        false;

      comment.removedByAdmin =
        null;

      await comment.save();

      console.log(
        "🛡️ ADMIN RESTORED COMMENT:",
        {
          commentId,

          adminId:
            req.user._id,
        }
      );

      return res.status(200).json({
        success:
          true,

        message:
          "Comment restored successfully",
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN RESTORE COMMENT ERROR:",
        error
      );

      return res.status(500).json({
        success:
          true,

        message:
          "Comment restored successfully",
      });
    }
  };