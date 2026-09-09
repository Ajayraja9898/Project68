import mongoose from "mongoose";

import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import CommunityMessage from "../models/CommunityMessage.js";

// ======================================================
// ADMIN DASHBOARD
// ======================================================

export const getAdminDashboard =
  async (
    req,
    res
  ) => {
    try {
      const [
        totalUsers,
        totalStudents,
        totalAdmins,
        onlineUsers,
        suspendedUsers,
        activeChats,
        communityMessages,
      ] =
        await Promise.all([
          User.countDocuments(),

          User.countDocuments({
            role:
              "student",
          }),

          User.countDocuments({
            role:
              "admin",
          }),

          User.countDocuments({
            isOnline:
              true,
          }),

          User.countDocuments({
            accountStatus:
              "suspended",
          }),

          Chat.countDocuments({
            status:
              "active",
          }),

          CommunityMessage.countDocuments({
            isDeleted:
              false,
          }),
        ]);

      return res.status(200).json({
        success:
          true,

        stats: {
          totalUsers,
          totalStudents,
          totalAdmins,
          onlineUsers,
          suspendedUsers,
          activeChats,
          communityMessages,
        },
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN DASHBOARD ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Failed to load admin dashboard",
      });
    }
  };

// ======================================================
// GET ALL USERS
// ======================================================

export const getAdminUsers =
  async (
    req,
    res
  ) => {
    try {
      const users =
        await User.find({})
          .select(
            "_id name rollNumber avatar role department year isOnline lastSeen xp level streak achievements accountStatus createdAt updatedAt"
          )
          .sort({
            createdAt:
              -1,
          })
          .lean();

      return res.status(200).json({
        success:
          true,

        count:
          users.length,

        users,
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN USERS ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Failed to load users",
      });
    }
  };

// ======================================================
// SUSPEND USER
// ======================================================

export const suspendUser =
  async (
    req,
    res
  ) => {
    try {
      const {
        userId,
      } = req.params;

      // ------------------------------------------------
      // Validate ID
      // ------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid user ID",
        });
      }

      // ------------------------------------------------
      // Prevent self suspension
      // ------------------------------------------------

      if (
        userId.toString() ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "You cannot suspend your own admin account.",
        });
      }

      // ------------------------------------------------
      // Find user
      // ------------------------------------------------

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          success:
            false,

          message:
            "User not found",
        });
      }

      // ------------------------------------------------
      // Protect admin accounts
      // ------------------------------------------------

      if (
        user.role ===
        "admin"
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Admin accounts cannot be suspended from student controls.",
        });
      }

      // ------------------------------------------------
      // Already suspended
      // ------------------------------------------------

      if (
        user.accountStatus ===
        "suspended"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "User is already suspended.",
        });
      }

      // ------------------------------------------------
      // Suspend
      // ------------------------------------------------

      user.accountStatus =
        "suspended";

      user.isOnline =
        false;

      user.isAvailableForPartner =
        false;

      user.lastSeen =
        new Date();

      await user.save();

      return res.status(200).json({
        success:
          true,

        message:
          "User suspended successfully.",

        user: {
          _id:
            user._id,

          accountStatus:
            user.accountStatus,

          isOnline:
            user.isOnline,

          isAvailableForPartner:
            user.isAvailableForPartner,
        },
      });
    } catch (error) {
      console.error(
        "🔥 SUSPEND USER ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Failed to suspend user",
      });
    }
  };

// ======================================================
// UNSUSPEND USER
// ======================================================

export const unsuspendUser =
  async (
    req,
    res
  ) => {
    try {
      const {
        userId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid user ID",
        });
      }

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          success:
            false,

          message:
            "User not found",
        });
      }

      if (
        user.accountStatus ===
        "active"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "User is already active.",
        });
      }

      user.accountStatus =
        "active";

      user.isOnline =
        false;

      user.isAvailableForPartner =
        false;

      user.lastSeen =
        new Date();

      await user.save();

      return res.status(200).json({
        success:
          true,

        message:
          "User unsuspended successfully.",

        user: {
          _id:
            user._id,

          accountStatus:
            user.accountStatus,

          isOnline:
            user.isOnline,

          isAvailableForPartner:
            user.isAvailableForPartner,
        },
      });
    } catch (error) {
      console.error(
        "🔥 UNSUSPEND USER ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Failed to unsuspend user",
      });
    }
  };

// ======================================================
// PRIVATE CHAT MONITORING
// ======================================================

// ======================================================
// GET ALL ACTIVE PRIVATE CHATS
// ======================================================

export const getAdminChats =
  async (
    req,
    res
  ) => {
    try {
      const chats =
        await Chat.find({
          status:
            "active",

          participants: {
            $size:
              2,
          },
        })
          .populate(
            "participants",
            "_id name rollNumber avatar department year role accountStatus isOnline lastSeen"
          )
          .sort({
            lastActivity:
              -1,
          })
          .lean();

      const safeChats =
        chats.map(
          (chat) => ({
            _id:
              chat._id,

            status:
              chat.status,

            isAnonymous:
              Boolean(
                chat.isAnonymous
              ),

            retentionMode:
              chat.retentionMode,

            expiresAt:
              chat.expiresAt,

            lastMessage:
              chat.lastMessage ||
              "",

            lastActivity:
              chat.lastActivity,

            createdAt:
              chat.createdAt,

            updatedAt:
              chat.updatedAt,

            anonymousIdentities:
              Array.isArray(
                chat.anonymousIdentities
              )
                ? chat.anonymousIdentities.map(
                    (
                      identity
                    ) => ({
                      user:
                        identity.user,

                      anonymousName:
                        identity.anonymousName,
                    })
                  )
                : [],

            participants:
              chat.participants.map(
                (user) => ({
                  _id:
                    user._id,

                  name:
                    user.name,

                  rollNumber:
                    user.rollNumber,

                  avatar:
                    user.avatar ||
                    "",

                  department:
                    user.department ||
                    "",

                  year:
                    user.year ||
                    "",

                  role:
                    user.role,

                  accountStatus:
                    user.accountStatus,

                  isOnline:
                    Boolean(
                      user.isOnline
                    ),

                  lastSeen:
                    user.lastSeen ||
                    null,
                })
              ),
          })
        );

      return res.status(200).json({
        success:
          true,

        count:
          safeChats.length,

        chats:
          safeChats,
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN GET CHATS ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to load private chats",
      });
    }
  };

// ======================================================
// GET ONE PRIVATE CHAT + MESSAGES
// ======================================================

export const getAdminChatById =
  async (
    req,
    res
  ) => {
    try {
      const {
        chatId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          chatId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid chat ID",
        });
      }

      const chat =
        await Chat.findById(
          chatId
        )
          .populate(
            "participants",
            "_id name rollNumber avatar department year role accountStatus isOnline lastSeen"
          )
          .lean();

      if (!chat) {
        return res.status(404).json({
          success:
            false,

          message:
            "Chat not found",
        });
      }

      const messages =
        await Message.find({
          chat:
            chatId,
        })
          .populate(
            "sender",
            "_id name rollNumber role"
          )
          .populate(
            "receiver",
            "_id name rollNumber role"
          )
          .populate(
            "replyTo",
            "_id sender receiver message createdAt isDeleted"
          )
          .sort({
            createdAt:
              1,
          })
          .lean();

      const safeMessages =
        messages.map(
          (item) => ({
            _id:
              item._id,

            message:
              item.message,

            attachment:
              item.attachment ||
              "",

            seen:
              Boolean(
                item.seen
              ),

            isDeleted:
              Boolean(
                item.isDeleted
              ),

            createdAt:
              item.createdAt,

            updatedAt:
              item.updatedAt,

            sender:
              item.sender
                ? {
                    _id:
                      item.sender
                        ._id,

                    name:
                      item.sender
                        .name,

                    rollNumber:
                      item.sender
                        .rollNumber,

                    role:
                      item.sender
                        .role,
                  }
                : null,

            receiver:
              item.receiver
                ? {
                    _id:
                      item.receiver
                        ._id,

                    name:
                      item.receiver
                        .name,

                    rollNumber:
                      item.receiver
                        .rollNumber,

                    role:
                      item.receiver
                        .role,
                  }
                : null,

            replyTo:
              item.replyTo
                ? {
                    _id:
                      item.replyTo
                        ._id,

                    message:
                      item.replyTo
                        .message,

                    createdAt:
                      item.replyTo
                        .createdAt,

                    isDeleted:
                      Boolean(
                        item.replyTo
                          .isDeleted
                      ),
                  }
                : null,
          })
        );

      return res.status(200).json({
        success:
          true,

        chat: {
          _id:
            chat._id,

          status:
            chat.status,

          isAnonymous:
            Boolean(
              chat.isAnonymous
            ),

          retentionMode:
            chat.retentionMode,

          expiresAt:
            chat.expiresAt,

          lastMessage:
            chat.lastMessage ||
            "",

          lastActivity:
            chat.lastActivity,

          createdAt:
            chat.createdAt,

          updatedAt:
            chat.updatedAt,

          anonymousIdentities:
            Array.isArray(
              chat.anonymousIdentities
            )
              ? chat.anonymousIdentities.map(
                  (
                    identity
                  ) => ({
                    user:
                      identity.user,

                    anonymousName:
                      identity.anonymousName,
                  })
                )
              : [],

          participants:
            chat.participants.map(
              (user) => ({
                _id:
                  user._id,

                name:
                  user.name,

                rollNumber:
                  user.rollNumber,

                avatar:
                  user.avatar ||
                  "",

                department:
                  user.department ||
                  "",

                year:
                  user.year ||
                  "",

                role:
                  user.role,

                accountStatus:
                  user.accountStatus,

                isOnline:
                  Boolean(
                    user.isOnline
                  ),

                lastSeen:
                  user.lastSeen ||
                  null,
              })
            ),
        },

        count:
          safeMessages.length,

        messages:
          safeMessages,
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN GET CHAT ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to load private chat",
      });
    }
  };

// ======================================================
// ADMIN DELETE PRIVATE CHAT MESSAGE
// ======================================================

export const adminDeleteChatMessage =
  async (
    req,
    res
  ) => {
    try {
      const {
        chatId,
        messageId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          chatId
        ) ||
        !mongoose.Types.ObjectId.isValid(
          messageId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid chat or message ID",
        });
      }

      const chat =
        await Chat.findById(
          chatId
        );

      if (!chat) {
        return res.status(404).json({
          success:
            false,

          message:
            "Chat not found",
        });
      }

      const message =
        await Message.findOne({
          _id:
            messageId,

          chat:
            chatId,
        });

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

      await message.save();

      return res.status(200).json({
        success:
          true,

        message:
          "Private-chat message deleted by administrator",

        messageId:
          message._id,
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN DELETE CHAT MESSAGE ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to delete private-chat message",
      });
    }
  };

// ======================================================
// ADMIN CLOSE PRIVATE CHAT
// ======================================================

export const adminCloseChat =
  async (
    req,
    res
  ) => {
    try {
      const {
        chatId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          chatId
        )
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invalid chat ID",
        });
      }

      const chat =
        await Chat.findById(
          chatId
        );

      if (!chat) {
        return res.status(404).json({
          success:
            false,

          message:
            "Chat not found",
        });
      }

      if (
        chat.status ===
        "closed"
      ) {
        return res.status(200).json({
          success:
            true,

          message:
            "Chat is already closed",
        });
      }

      chat.status =
        "closed";

      await chat.save();

      const participantIds =
        chat.participants;

      await User.updateMany(
        {
          _id: {
            $in:
              participantIds,
          },

          role:
            "student",

          accountStatus:
            "active",
        },
        {
          $set: {
            isAvailableForPartner:
              true,
          },
        }
      );

      return res.status(200).json({
        success:
          true,

        message:
          "Private chat closed successfully",
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN CLOSE CHAT ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to close private chat",
      });
    }
  };

// ======================================================
// ADMIN COMMUNITY CHAT MONITORING
// ======================================================
//
// Returns community messages with the internal real
// author information for administrator use.
//
// STUDENTS NEVER RECEIVE THIS RESPONSE.
//
// Older messages created before the `author` field was
// added may have author === null.
// ======================================================

export const getAdminCommunityMessages =
  async (
    req,
    res
  ) => {
    try {
      const messages =
        await CommunityMessage.find({})
          .populate(
            "author",
            "_id name rollNumber avatar role department year accountStatus isOnline lastSeen"
          )
          .populate(
            "deletedBy",
            "_id name rollNumber role"
          )
          .populate(
            "replyTo",
            "anonymousName message imageUrl author createdAt retention expiresAt isDeleted"
          )
          .sort({
            createdAt:
              -1,
          })
          .limit(500)
          .lean();

      const now =
        new Date();

      const safeMessages =
        messages.map(
          (item) => {
            // ------------------------------------------
            // Safe reply
            // ------------------------------------------

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
                    item
                      .replyTo
                      ._id,

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

                  authorId:
                    item
                      .replyTo
                      .author ||
                    null,

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

            // ------------------------------------------
            // Admin message representation
            // ------------------------------------------

            return {
              _id:
                item._id,

              anonymousName:
                item.anonymousName,

              author:
                item.author
                  ? {
                      _id:
                        item.author
                          ._id,

                      name:
                        item.author
                          .name,

                      rollNumber:
                        item.author
                          .rollNumber,

                      avatar:
                        item.author
                          .avatar ||
                        "",

                      role:
                        item.author
                          .role,

                      department:
                        item.author
                          .department ||
                        "",

                      year:
                        item.author
                          .year ||
                        null,

                      accountStatus:
                        item.author
                          .accountStatus,

                      isOnline:
                        Boolean(
                          item.author
                            .isOnline
                        ),

                      lastSeen:
                        item.author
                          .lastSeen ||
                        null,
                    }
                  : null,

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

              isExpired:
                Boolean(
                  item.expiresAt &&
                  new Date(
                    item.expiresAt
                  ).getTime() <=
                    now.getTime()
                ),

              isDeleted:
                Boolean(
                  item.isDeleted
                ),

              deletedByAdmin:
                Boolean(
                  item.deletedByAdmin
                ),

              deletedBy:
                item.deletedBy ||
                null,

              createdAt:
                item.createdAt,

              updatedAt:
                item.updatedAt,
            };
          }
        );

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
        "🔥 ADMIN GET COMMUNITY MESSAGES ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to load community chat messages",
      });
    }
  };

// ======================================================
// ADMIN GET ONE COMMUNITY MESSAGE
// ======================================================

export const getAdminCommunityMessageById =
  async (
    req,
    res
  ) => {
    try {
      const {
        messageId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
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
        )
          .populate(
            "author",
            "_id name rollNumber avatar role department year accountStatus isOnline lastSeen"
          )
          .populate(
            "deletedBy",
            "_id name rollNumber role"
          )
          .populate(
            "replyTo",
            "anonymousName message imageUrl author createdAt retention expiresAt isDeleted"
          )
          .lean();

      if (!message) {
        return res.status(404).json({
          success:
            false,

          message:
            "Community message not found",
        });
      }

      const now =
        new Date();

      let reply =
        null;

      if (
        message.replyTo &&
        !message.replyTo.isDeleted
      ) {
        const replyExpired =
          message.replyTo.expiresAt &&
          new Date(
            message.replyTo.expiresAt
          ).getTime() <=
            now.getTime();

        if (
          !replyExpired
        ) {
          reply = {
            _id:
              message
                .replyTo
                ._id,

            anonymousName:
              message
                .replyTo
                .anonymousName,

            message:
              message
                .replyTo
                .message ||
              "",

            imageUrl:
              message
                .replyTo
                .imageUrl ||
              "",

            authorId:
              message
                .replyTo
                .author ||
              null,

            createdAt:
              message
                .replyTo
                .createdAt,

            retention:
              message
                .replyTo
                .retention,

            expiresAt:
              message
                .replyTo
                .expiresAt,
          };
        }
      }

      return res.status(200).json({
        success:
          true,

        message: {
          _id:
            message._id,

          anonymousName:
            message.anonymousName,

          author:
            message.author
              ? {
                  _id:
                    message
                      .author
                      ._id,

                  name:
                    message
                      .author
                      .name,

                  rollNumber:
                    message
                      .author
                      .rollNumber,

                  avatar:
                    message
                      .author
                      .avatar ||
                    "",

                  role:
                    message
                      .author
                      .role,

                  department:
                    message
                      .author
                      .department ||
                    "",

                  year:
                    message
                      .author
                      .year ||
                    null,

                  accountStatus:
                    message
                      .author
                      .accountStatus,

                  isOnline:
                    Boolean(
                      message
                        .author
                        .isOnline
                    ),

                  lastSeen:
                    message
                      .author
                      .lastSeen ||
                    null,
                }
              : null,

          message:
            message.message ||
            "",

          imageUrl:
            message.imageUrl ||
            "",

          replyTo:
            reply,

          retention:
            message.retention ===
            "never"
              ? "never"
              : "24h",

          expiresAt:
            message.expiresAt ||
            null,

          isDeleted:
            Boolean(
              message.isDeleted
            ),

          deletedByAdmin:
            Boolean(
              message.deletedByAdmin
            ),

          deletedBy:
            message.deletedBy ||
            null,

          createdAt:
            message.createdAt,

          updatedAt:
            message.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN GET COMMUNITY MESSAGE ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to load community message",
      });
    }
  };

// ======================================================
// ADMIN DELETE COMMUNITY CHAT MESSAGE
// ======================================================

export const adminDeleteCommunityMessage =
  async (
    req,
    res
  ) => {
    try {
      const {
        messageId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
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
            "Community message not found",
        });
      }

      if (
        message.isDeleted
      ) {
        return res.status(200).json({
          success:
            true,

          message:
            "Community message already deleted",
        });
      }

      message.isDeleted =
        true;

      message.deletedByAdmin =
        true;

      message.deletedBy =
        req.user._id;

      await message.save();

      return res.status(200).json({
        success:
          true,

        message:
          "Community message deleted by administrator",

        messageId:
          message._id,
      });
    } catch (error) {
      console.error(
        "🔥 ADMIN DELETE COMMUNITY MESSAGE ERROR:",
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