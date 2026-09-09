import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";

import CommunityMessage from "./models/CommunityMessage.js";

import {
  updateAchievementProgress,
} from "./services/achievementService.js";

dotenv.config();

console.log("🔥 SERVER.JS IS RUNNING");

// ======================================================
// DATABASE
// ======================================================

connectDB();

// ======================================================
// EXPRESS
// ======================================================

const app = express();

const httpServer = createServer(app);

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests such as Postman/server-to-server
      // where there is no browser Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS BLOCKED:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// ======================================================
// SOCKET.IO
// ======================================================

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ======================================================
// MAKE SOCKET.IO INSTANCE AVAILABLE TO OTHER MODULES
// ======================================================

export { io };

console.log("✅ Socket.IO initialized");

// ======================================================
// SOCKET.IO AUTHENTICATION
// ======================================================

io.use(
  async (socket, next) => {
    try {
      const rawCookie =
        socket.handshake.headers.cookie || "";

      const tokenMatch =
        rawCookie.match(
          /(?:^|;\s*)token=([^;]+)/
        );

      const token = tokenMatch
        ? decodeURIComponent(tokenMatch[1])
        : "";

      // ------------------------------------------------
      // Token missing
      // ------------------------------------------------

      if (!token) {
        console.log(
          "❌ SOCKET AUTH: TOKEN MISSING"
        );

        return next(
          new Error(
            "Authentication token missing"
          )
        );
      }

      // ------------------------------------------------
      // Verify JWT
      // ------------------------------------------------

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // ------------------------------------------------
      // Get user ID
      // ------------------------------------------------

      const userId =
        decoded.id ||
        decoded._id ||
        decoded.userId ||
        "";

      if (!userId) {
        console.log(
          "❌ SOCKET AUTH: USER ID MISSING"
        );

        return next(
          new Error(
            "Invalid authentication token"
          )
        );
      }

      // ------------------------------------------------
      // Load current user
      // ------------------------------------------------

      const User = (
        await import("./models/User.js")
      ).default;

      const user = await User.findById(
        userId
      ).select(
        "_id role accountStatus"
      );

      // ------------------------------------------------
      // User not found
      // ------------------------------------------------

      if (!user) {
        console.log(
          "❌ SOCKET AUTH: USER NOT FOUND:",
          userId
        );

        return next(
          new Error("User not found")
        );
      }

      // ------------------------------------------------
      // Suspended account
      // ------------------------------------------------

      if (
        user.accountStatus ===
        "suspended"
      ) {
        console.log(
          "⛔ SOCKET AUTH: SUSPENDED USER:",
          userId
        );

        return next(
          new Error(
            "ACCOUNT_SUSPENDED"
          )
        );
      }

      // ------------------------------------------------
      // Store authenticated information
      // ------------------------------------------------

      socket.userId = String(
        user._id
      );

      socket.userRole = user.role;

      console.log(
        "🔐 SOCKET AUTHENTICATED:",
        socket.userId
      );

      console.log(
        "👤 SOCKET ROLE:",
        socket.userRole
      );

      next();
    } catch (error) {
      console.error(
        "🔥 SOCKET AUTH ERROR:",
        error.message
      );

      return next(
        new Error(
          "Invalid authentication token"
        )
      );
    }
  }
);

// ======================================================
// COMMUNITY ROOM
// ======================================================

const COMMUNITY_ROOM = "community";

// ======================================================
// COMMUNITY USERS
// ======================================================

const communityUsers = new Map();

// ======================================================
// GENERATE COMMUNITY ANONYMOUS NAME
// ======================================================

function generateCommunityAnonymousName(
  userId,
  socketId
) {
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
    "Dark",
    "Bright",
    "Silver",
    "Golden",
    "Unknown",
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
    "Phoenix",
    "Otter",
    "Raven",
    "Deer",
    "Cobra",
  ];

  const hash = crypto
    .createHash("sha256")
    .update(`${userId}:${socketId}`)
    .digest("hex");

  const adjectiveIndex =
    parseInt(
      hash.substring(0, 8),
      16
    ) % adjectives.length;

  const animalIndex =
    parseInt(
      hash.substring(8, 16),
      16
    ) % animals.length;

  const number =
    100 +
    (
      parseInt(
        hash.substring(16, 24),
        16
      ) % 900
    );

  return `${adjectives[adjectiveIndex]}${animals[animalIndex]}${number}`;
}

// ======================================================
// PRIVATE CHAT ROOM
// ======================================================

function getPrivateChatRoom(chatId) {
  return `private-chat:${chatId}`;
}

// ======================================================
// SOCKET CONNECTION
// ======================================================

io.on(
  "connection",
  (socket) => {
    console.log(
      "🟢 SOCKET CONNECTED:",
      socket.id
    );

    console.log(
      "👤 SOCKET USER:",
      socket.userId
    );

    // ==================================================
    // PRIVATE CHAT JOIN
    // ==================================================

    socket.on(
      "private-chat:join",
      async (chatId) => {
        try {
          if (!chatId) {
            socket.emit(
              "private-chat:error",
              {
                message:
                  "Chat ID is required",
              }
            );

            return;
          }

          const Chat = (
            await import(
              "./models/Chat.js"
            )
          ).default;

          const chat =
            await Chat.findOne({
              _id: chatId,
              participants:
                socket.userId,
              status: "active",
            });

          if (!chat) {
            console.log(
              "❌ PRIVATE CHAT JOIN DENIED:",
              chatId,
              socket.userId
            );

            socket.emit(
              "private-chat:error",
              {
                message:
                  "You are not a participant of this chat",
              }
            );

            return;
          }

          if (
            chat.retentionMode ===
              "24h" &&
            chat.expiresAt &&
            new Date() >=
              new Date(
                chat.expiresAt
              )
          ) {
            socket.emit(
              "private-chat:error",
              {
                message:
                  "This chat has expired.",
              }
            );

            return;
          }

          const room =
            getPrivateChatRoom(
              chatId
            );

          socket.join(room);

          console.log(
            "💬 PRIVATE CHAT JOINED:",
            room
          );

          console.log(
            "👤 USER:",
            socket.userId
          );

          socket.emit(
            "private-chat:joined",
            {
              chatId,
            }
          );
        } catch (error) {
          console.error(
            "🔥 PRIVATE CHAT JOIN ERROR:",
            error
          );

          socket.emit(
            "private-chat:error",
            {
              message:
                "Unable to join private chat",
            }
          );
        }
      }
    );

    // ==================================================
    // PRIVATE CHAT LEAVE
    // ==================================================

    socket.on(
      "private-chat:leave",
      (chatId) => {
        try {
          if (!chatId) {
            return;
          }

          const room =
            getPrivateChatRoom(
              chatId
            );

          socket.leave(room);

          console.log(
            "👋 PRIVATE CHAT LEFT:",
            room
          );

          console.log(
            "👤 USER:",
            socket.userId
          );
        } catch (error) {
          console.error(
            "🔥 PRIVATE CHAT LEAVE ERROR:",
            error
          );
        }
      }
    );

    // ==================================================
    // COMMUNITY JOIN
    // ==================================================

    socket.on(
      "community:join",
      () => {
        try {
          const safeName =
            generateCommunityAnonymousName(
              socket.userId,
              socket.id
            );

          communityUsers.set(
            socket.id,
            safeName
          );

          socket.join(
            COMMUNITY_ROOM
          );

          console.log(
            `👤 ${safeName} joined Community`
          );

          socket
            .to(COMMUNITY_ROOM)
            .emit(
              "community:user-joined",
              {
                anonymousName:
                  safeName,
              }
            );
        } catch (error) {
          console.error(
            "🔥 COMMUNITY JOIN ERROR:",
            error
          );
        }
      }
    );

    // ==================================================
    // COMMUNITY MESSAGE
    // ==================================================

    socket.on(
      "community:message",
      async (messageData) => {
        try {
          console.log(
            "💬 COMMUNITY MESSAGE RECEIVED:",
            messageData
          );

          // =================================================
          // AUTHENTICATED USER
          // =================================================

          const authorId =
            socket.userId;

          if (!authorId) {
            console.log(
              "❌ COMMUNITY MESSAGE REJECTED: SOCKET USER MISSING"
            );

            socket.emit(
              "community:message-error",
              {
                message:
                  "Authentication required",
              }
            );

            return;
          }

          // =================================================
          // SERVER-CONTROLLED ANONYMOUS NAME
          // =================================================

          let anonymousName =
            communityUsers.get(
              socket.id
            );

          if (!anonymousName) {
            anonymousName =
              generateCommunityAnonymousName(
                authorId,
                socket.id
              );

            communityUsers.set(
              socket.id,
              anonymousName
            );
          }

          // =================================================
          // MESSAGE
          // =================================================

          const message =
            String(
              messageData?.message ||
                ""
            ).trim();

          // =================================================
          // IMAGE
          // =================================================

          const imageUrl =
            String(
              messageData?.imageUrl ||
                ""
            ).trim();

          // =================================================
          // REPLY
          // =================================================

          const replyTo =
            messageData?.replyTo ||
            null;

          // =================================================
          // RETENTION
          // =================================================

          const retention =
            messageData?.retention ===
            "never"
              ? "never"
              : "24h";

          let expiresAt = null;

          if (
            retention === "24h"
          ) {
            expiresAt =
              new Date(
                Date.now() +
                  24 *
                    60 *
                    60 *
                    1000
              );
          }

          console.log(
            "⏳ COMMUNITY MESSAGE RETENTION:",
            retention
          );

          console.log(
            "🕐 COMMUNITY MESSAGE EXPIRES AT:",
            expiresAt
          );

          // =================================================
          // VALIDATE CONTENT
          // =================================================

          if (
            !message &&
            !imageUrl
          ) {
            console.log(
              "⚠️ Empty community message ignored"
            );

            return;
          }

          // =================================================
          // VALIDATE REPLY
          // =================================================

          let validReplyTo = null;

          if (replyTo) {
            try {
              if (
                !/^[0-9a-fA-F]{24}$/.test(
                  String(replyTo)
                )
              ) {
                console.log(
                  "⚠️ Invalid reply ID:",
                  replyTo
                );

                socket.emit(
                  "community:message-error",
                  {
                    message:
                      "Invalid reply message ID",
                  }
                );

                return;
              }

              const replyMessage =
                await CommunityMessage.findOne(
                  {
                    _id: replyTo,

                    isDeleted: false,

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
                console.log(
                  "⚠️ Reply message not found or expired:",
                  replyTo
                );

                socket.emit(
                  "community:message-error",
                  {
                    message:
                      "Reply message not found or expired",
                  }
                );

                return;
              }

              validReplyTo =
                replyMessage._id;
            } catch (error) {
              console.error(
                "🔥 COMMUNITY REPLY VALIDATION ERROR:",
                error
              );

              socket.emit(
                "community:message-error",
                {
                  message:
                    "Unable to validate reply",
                }
              );

              return;
            }
          }

          // =================================================
          // SAVE COMMUNITY MESSAGE
          // =================================================

          const newCommunityMessage =
            await CommunityMessage.create(
              {
                author: authorId,

                anonymousName:
                  anonymousName,

                message: message,

                imageUrl: imageUrl,

                replyTo:
                  validReplyTo,

                retention:
                  retention,

                expiresAt:
                  expiresAt,

                isDeleted: false,

                deletedByAdmin:
                  false,

                deletedBy: null,
              }
            );

          console.log(
            "💾 COMMUNITY MESSAGE SAVED:",
            newCommunityMessage._id
          );

          console.log(
            "📌 AUTHOR:",
            newCommunityMessage.author
          );

          console.log(
            "📌 ANONYMOUS NAME:",
            newCommunityMessage.anonymousName
          );

          console.log(
            "📌 RETENTION:",
            newCommunityMessage.retention
          );

          console.log(
            "📌 EXPIRES AT:",
            newCommunityMessage.expiresAt
          );

          // =================================================
          // COMMUNITY ACHIEVEMENT
          // =================================================

          try {
            const unlockedAchievements =
              await updateAchievementProgress(
                authorId,
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
                  (achievement) =>
                    achievement.name
                )
              );
            }
          } catch (
            achievementError
          ) {
            console.error(
              "⚠️ COMMUNITY SOCKET ACHIEVEMENT ERROR:",
              achievementError
            );
          }

          // =================================================
          // POPULATE REPLY
          // =================================================

          const populatedMessage =
            await CommunityMessage.findById(
              newCommunityMessage._id
            ).populate(
              "replyTo",
              "anonymousName message imageUrl createdAt retention expiresAt"
            );

          if (!populatedMessage) {
            socket.emit(
              "community:message-error",
              {
                message:
                  "Unable to load saved community message",
              }
            );

            return;
          }

          // =================================================
          // SAFE REPLY
          // =================================================

          let safeReply = null;

          if (
            populatedMessage.replyTo &&
            !populatedMessage.replyTo
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

            if (!replyExpired) {
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

          // =================================================
          // SAFE MESSAGE
          // =================================================
          //
          // IMPORTANT:
          // We deliberately DO NOT include:
          //
          // author
          // user ID
          // real name
          // roll number
          //
          // =================================================

          const broadcastMessage = {
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
                .expiresAt,

            isDeleted: false,

            deletedByAdmin:
              false,

            createdAt:
              populatedMessage
                .createdAt,

            updatedAt:
              populatedMessage
                .updatedAt,
          };

          // =================================================
          // SEND MESSAGE TO SENDER
          // =================================================
          //
          // The sender receives isMine:true.
          //
          // This is what makes the new message immediately
          // appear on the RIGHT side.
          //
          // =================================================

          socket.emit(
            "community:message",
            {
              ...broadcastMessage,

              isMine: true,
            }
          );

          // =================================================
          // SEND MESSAGE TO OTHER USERS
          // =================================================
          //
          // Everyone else receives isMine:false.
          //
          // This makes their message appear on the LEFT.
          //
          // =================================================

          socket.broadcast
            .to(COMMUNITY_ROOM)
            .emit(
              "community:message",
              {
                ...broadcastMessage,

                isMine: false,
              }
            );

          console.log(
            "📢 COMMUNITY MESSAGE SENT TO SENDER + OTHER USERS"
          );
        } catch (error) {
          console.error(
            "🔥 COMMUNITY SOCKET MESSAGE ERROR:",
            error
          );

          socket.emit(
            "community:message-error",
            {
              message:
                "Unable to send community message",
            }
          );
        }
      }
    );

    // ==================================================
    // COMMUNITY MESSAGE DELETE
    // ==================================================

    socket.on(
      "community:message-delete",
      async (messageId) => {
        try {
          console.log(
            "🛡️ COMMUNITY DELETE REQUEST:",
            messageId
          );

          // --------------------------------------------
          // Validate ID
          // --------------------------------------------

          if (
            !messageId ||
            !/^[0-9a-fA-F]{24}$/.test(
              String(messageId)
            )
          ) {
            socket.emit(
              "community:message-delete-error",
              {
                message:
                  "Invalid message ID",
              }
            );

            return;
          }

          // --------------------------------------------
          // Find message
          // --------------------------------------------

          const communityMessage =
            await CommunityMessage.findById(
              messageId
            );

          if (!communityMessage) {
            socket.emit(
              "community:message-delete-error",
              {
                message:
                  "Message not found",
              }
            );

            return;
          }

          // --------------------------------------------
          // Already deleted
          // --------------------------------------------

          if (
            communityMessage.isDeleted
          ) {
            io.to(
              COMMUNITY_ROOM
            ).emit(
              "community:message-deleted",
              String(messageId)
            );

            return;
          }

          // --------------------------------------------
          // Check admin
          // --------------------------------------------

          const User = (
            await import(
              "./models/User.js"
            )
          ).default;

          const deletingUser =
            await User.findById(
              socket.userId
            ).select(
              "role accountStatus"
            );

          if (
            !deletingUser ||
            deletingUser.accountStatus !==
              "active" ||
            deletingUser.role !==
              "admin"
          ) {
            socket.emit(
              "community:message-delete-error",
              {
                message:
                  "Administrator access required",
              }
            );

            return;
          }

          // --------------------------------------------
          // Soft delete
          // --------------------------------------------

          communityMessage.isDeleted =
            true;

          communityMessage.deletedByAdmin =
            true;

          communityMessage.deletedBy =
            socket.userId;

          await communityMessage.save();

          console.log(
            "🛡️ COMMUNITY MESSAGE SOFT DELETED:",
            messageId
          );

          // --------------------------------------------
          // Broadcast deletion
          // --------------------------------------------

          io.to(
            COMMUNITY_ROOM
          ).emit(
            "community:message-deleted",
            String(messageId)
          );

          console.log(
            "📢 COMMUNITY MESSAGE DELETION BROADCASTED:",
            messageId
          );
        } catch (error) {
          console.error(
            "🔥 COMMUNITY MESSAGE DELETE ERROR:",
            error
          );

          socket.emit(
            "community:message-delete-error",
            {
              message:
                "Unable to delete community message",
            }
          );
        }
      }
    );

    // ==================================================
    // COMMUNITY LEAVE
    // ==================================================

    socket.on(
      "community:leave",
      () => {
        const anonymousName =
          communityUsers.get(
            socket.id
          );

        console.log(
          `👋 ${
            anonymousName ||
            "User"
          } left Community`
        );

        communityUsers.delete(
          socket.id
        );

        socket
          .to(COMMUNITY_ROOM)
          .emit(
            "community:user-left",
            {
              anonymousName:
                anonymousName ||
                "Anonymous",
            }
          );

        socket.leave(
          COMMUNITY_ROOM
        );
      }
    );

    // ==================================================
    // DISCONNECT
    // ==================================================

    socket.on(
      "disconnect",
      () => {
        const anonymousName =
          communityUsers.get(
            socket.id
          );

        console.log(
          "🔴 SOCKET DISCONNECTED:",
          socket.id
        );

        if (anonymousName) {
          console.log(
            `👋 ${anonymousName} disconnected`
          );

          socket
            .to(COMMUNITY_ROOM)
            .emit(
              "community:user-left",
              {
                anonymousName,
              }
            );
        }

        communityUsers.delete(
          socket.id
        );

        console.log(
          "🧹 SOCKET USER CLEANED:",
          socket.userId
        );
      }
    );
  }
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,

      version:
        "VERSION_12345",

      message:
        "🚀 Project68 Backend Running",
    });
  }
);

// ======================================================
// API TEST
// ======================================================

app.get(
  "/api/test",
  (req, res) => {
    res.json({
      success: true,

      message:
        "✅ API Test Route Working",
    });
  }
);

// ======================================================
// AUTH ROUTES
// ======================================================

console.log(
  "✅ Loading auth routes..."
);

app.use(
  "/api/auth",
  authRoutes
);

// ======================================================
// CHAT ROUTES
// ======================================================

console.log(
  "✅ Loading chat routes..."
);

app.use(
  "/api/chat",
  chatRoutes
);

// ======================================================
// ADMIN ROUTES
// ======================================================

console.log(
  "🛡️ Loading admin routes..."
);

app.use(
  "/api/admin",
  adminRoutes
);

console.log(
  "🛡️ Admin routes loaded"
);

// ======================================================
// INVITE ROUTES
// ======================================================

console.log(
  "✅ Loading invite routes..."
);

app.use(
  "/api/invite",
  inviteRoutes
);

// ======================================================
// PARTNER ROUTES
// ======================================================

console.log(
  "🤝 Loading partner routes..."
);

app.use(
  "/api/partner",
  partnerRoutes
);

console.log(
  "🤝 Partner routes loaded"
);

// ======================================================
// MESSAGE ROUTES
// ======================================================

console.log(
  "✅ Loading message routes..."
);

app.use(
  "/api/message",
  messageRoutes
);

// ======================================================
// COMMUNITY ROUTES
// ======================================================

console.log(
  "✅ Loading community routes..."
);

app.use(
  "/api/community",
  communityRoutes
);

console.log(
  "✅ Community routes loaded"
);

// ======================================================
// PROFILE ROUTES
// ======================================================

console.log(
  "✅ Loading profile routes..."
);

app.use(
  "/api/profile",
  profileRoutes
);

console.log(
  "✅ Profile routes loaded"
);

// ======================================================
// NOTIFICATION ROUTES
// ======================================================

console.log(
  "✅ Loading notification routes..."
);

app.use(
  "/api/notification",
  notificationRoutes
);

console.log(
  "🔔 Notification routes loaded"
);

// ======================================================
// ACHIEVEMENT ROUTES
// ======================================================

console.log(
  "🏆 Loading achievement routes..."
);

app.use(
  "/api/achievement",
  achievementRoutes
);

console.log(
  "🏆 Achievement routes loaded"
);

// ======================================================
// 404
// ======================================================

app.use(
  (req, res) => {
    console.log(
      `❌ 404: ${req.method} ${req.originalUrl}`
    );

    res.status(404).json({
      success: false,

      message:
        `Route ${req.method} ${req.originalUrl} not found`,
    });
  }
);

// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "🔥 SERVER ERROR:",
      error
    );

    // --------------------------------------------
    // CORS
    // --------------------------------------------

    if (
      error.message ===
      "Not allowed by CORS"
    ) {
      return res.status(403).json({
        success: false,

        message:
          "CORS blocked this request",
      });
    }

    // --------------------------------------------
    // General
    // --------------------------------------------

    return res.status(500).json({
      success: false,

      message:
        "Internal Server Error",
    });
  }
);

// ======================================================
// START SERVER
// ======================================================

const PORT =
  process.env.PORT || 5000;

httpServer.listen(
  PORT,
  () => {
    console.log(
      `🚀 Server running on http://localhost:${PORT}`
    );

    console.log(
      `⚡ Socket.IO running on port ${PORT}`
    );

    console.log(
      `💬 Community API: http://localhost:${PORT}/api/community`
    );

    console.log(
      `👤 Profile API: http://localhost:${PORT}/api/profile`
    );

    console.log(
      `🔔 Notification API: http://localhost:${PORT}/api/notification`
    );

    console.log(
      `🏆 Achievement API: http://localhost:${PORT}/api/achievement`
    );

    console.log(
      `🛡️ Admin API: http://localhost:${PORT}/api/admin`
    );
  }
);