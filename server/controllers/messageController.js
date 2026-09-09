import crypto from "crypto";

import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

import {
  updateAchievementProgress,
} from "../services/achievementService.js";

// ======================================================
// GENERATE ANONYMOUS CHAT IDENTITY
// ======================================================

function generateAnonymousName(
  sessionKey,
  userId
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
    .update(`${sessionKey}:${userId}`)
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
// GET CURRENT LOGIN SESSION KEY
// ======================================================

function getSessionKey(req) {
  const authorization =
    req.headers.authorization || "";

  if (
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return "unknown-session";
  }

  return authorization.substring(7);
}

// ======================================================
// CHECK CHAT EXPIRATION
// ======================================================

function chatHasExpired(chat) {
  return (
    chat.retentionMode ===
      "24h" &&
    chat.expiresAt &&
    new Date() >=
      new Date(chat.expiresAt)
  );
}

// ======================================================
// EXPIRE CHAT MESSAGES
// ======================================================

async function expireChatMessages(
  chatId
) {
  await Message.updateMany(
    {
      chat: chatId,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
      },
    }
  );
}

// ======================================================
// EXPIRE CHAT
// ======================================================

async function expireChat(chat) {
  await expireChatMessages(
    chat._id
  );

  chat.status =
    "closed";

  await chat.save();
}

// ======================================================
// VERIFY CHAT PARTICIPANT
// ======================================================

async function verifyChatParticipant(
  chatId,
  userId
) {
  return await Chat.findOne({
    _id: chatId,

    participants:
      userId,

    status:
      "active",
  });
}

// ======================================================
// GET ANONYMOUS NAME
// ======================================================

function getAnonymousName(
  userId,
  sessionKey
) {
  return generateAnonymousName(
    sessionKey,
    userId.toString()
  );
}

// ======================================================
// GET MESSAGES
// ======================================================

export const getMessages =
  async (
    req,
    res
  ) => {
    try {
      const {
        chatId,
      } = req.params;

      // ------------------------------------------------
      // Verify participant
      // ------------------------------------------------

      const chat =
        await verifyChatParticipant(
          chatId,
          req.user._id
        );

      if (!chat) {
        return res.status(403).json({
          success:
            false,

          message:
            "You are not a participant of this chat",
        });
      }

      // ------------------------------------------------
      // Check expiration
      // ------------------------------------------------

      if (
        chatHasExpired(
          chat
        )
      ) {
        await expireChat(
          chat
        );

        return res.status(200).json({
          success:
            true,

          count:
            0,

          messages: [],
        });
      }

      // ------------------------------------------------
      // Get messages
      // ------------------------------------------------

      const messages =
        await Message.find({
          chat:
            chatId,

          isDeleted:
            false,
        })
          .populate(
            "replyTo",
            "_id sender receiver message createdAt"
          )
          .sort({
            createdAt:
              1,
          })
          .lean();

      // ------------------------------------------------
      // Current session
      // ------------------------------------------------

      const sessionKey =
        getSessionKey(
          req
        );

      const currentUserId =
        req.user._id.toString();

      // ------------------------------------------------
      // Convert to safe response
      // ------------------------------------------------

      const safeMessages =
        messages.map(
          (item) => {
            const senderId =
              item.sender?.toString();

            const receiverId =
              item.receiver?.toString();

            const senderAnonymous =
              senderId
                ? getAnonymousName(
                    senderId,
                    sessionKey
                  )
                : "Anonymous";

            const receiverAnonymous =
              receiverId
                ? getAnonymousName(
                    receiverId,
                    sessionKey
                  )
                : "Anonymous";

            // ------------------------------------------
            // Safe reply
            // ------------------------------------------

            let safeReply =
              null;

            if (
              item.replyTo
            ) {
              const replySenderId =
                item.replyTo.sender?.toString();

              const replyAnonymous =
                replySenderId
                  ? getAnonymousName(
                      replySenderId,
                      sessionKey
                    )
                  : "Anonymous";

              safeReply = {
                _id:
                  item.replyTo
                    ._id,

                anonymousName:
                  replyAnonymous,

                message:
                  item.replyTo
                    .message,

                createdAt:
                  item.replyTo
                    .createdAt,
              };
            }

            // ------------------------------------------
            // Safe message
            // ------------------------------------------

            return {
              _id:
                item._id,

              chat:
                item.chat,

              sender: {
                anonymousName:
                  senderAnonymous,

                isMe:
                  senderId ===
                  currentUserId,
              },

              receiver: {
                anonymousName:
                  receiverAnonymous,
              },

              message:
                item.message,

              attachment:
                item.attachment ||
                "",

              replyTo:
                safeReply,

              seen:
                item.seen,

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
        "GET MESSAGES ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Server Error",
      });
    }
  };

// ======================================================
// SEND MESSAGE
// ======================================================

export const sendMessage =
  async (
    req,
    res
  ) => {
    try {
      const {
        chatId,
        message,
        replyTo,
      } = req.body;

      // ------------------------------------------------
      // Validate
      // ------------------------------------------------

      if (
        !chatId ||
        !message ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields",
        });
      }

      // ------------------------------------------------
      // Verify chat
      // ------------------------------------------------

      const chat =
        await verifyChatParticipant(
          chatId,
          req.user._id
        );

      if (!chat) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a participant of this chat",
        });
      }

      // ------------------------------------------------
      // Determine receiver from chat participants
      // ------------------------------------------------
      //
      // IMPORTANT:
      // Never trust receiverId supplied by the client.
      // The authenticated user's other chat participant
      // is the receiver.
      // ------------------------------------------------

      const receiver =
        chat.participants.find(
          (participantId) =>
            participantId.toString() !==
            req.user._id.toString()
        );

      if (!receiver) {
        return res.status(400).json({
          success: false,
          message:
            "Receiver could not be determined",
        });
      }

      const receiverId =
        receiver.toString();

      // ------------------------------------------------
      // Check expiration
      // ------------------------------------------------

      if (
        chatHasExpired(
          chat
        )
      ) {
        await expireChat(
          chat
        );

        return res.status(400).json({
          success: false,
          message:
            "This chat has expired because its messages were set to delete after 24 hours.",
        });
      }
      
      // ------------------------------------------------
      // Validate reply
      // ------------------------------------------------

      let validReplyTo =
        null;

      if (replyTo) {
        const replyMessage =
          await Message.findOne({
            _id:
              replyTo,

            chat:
              chatId,

            isDeleted:
              false,
          });

        if (!replyMessage) {
          return res.status(400).json({
            success:
              false,

            message:
              "Reply message not found",
          });
        }

        validReplyTo =
          replyMessage._id;
      }

      // ------------------------------------------------
      // Clean message
      // ------------------------------------------------

      const cleanMessage =
        message.trim();

      // ------------------------------------------------
      // Create message
      // ------------------------------------------------

      const newMessage =
        await Message.create({
          chat:
            chatId,

          sender:
            req.user._id,

          receiver:
            receiverId,

          message:
            cleanMessage,

          replyTo:
            validReplyTo,
        });

      // =================================================
      // ACHIEVEMENT PROGRESS
      // =================================================
      //
      // Only award progress after the message has been
      // successfully stored.
      //
      // The achievement service is intentionally isolated
      // from message delivery. If achievement processing
      // fails, the user's message still succeeds.
      //
      // First Message:
      //   requirement = 1
      //
      // Chat Starter:
      //   requirement = 10
      //
      // =================================================

      try {
        const unlockedAchievements =
          await updateAchievementProgress(
            req.user._id,
            "chat",
            1
          );

        if (
          unlockedAchievements.length >
          0
        ) {
          console.log(
            "🏆 PRIVATE CHAT ACHIEVEMENTS UNLOCKED:",
            unlockedAchievements.map(
              (achievement) =>
                achievement.name
            )
          );
        }
      } catch (achievementError) {
        console.error(
          "⚠️ CHAT ACHIEVEMENT ERROR:",
          achievementError
        );

        // Do NOT fail the message request.
      }

      // ------------------------------------------------
      // Update chat activity
      // ------------------------------------------------

      await Chat.findByIdAndUpdate(
        chatId,
        {
          lastMessage:
            cleanMessage,

          lastMessageSender:
            req.user._id,

          lastActivity:
            new Date(),
        }
      );

      // ------------------------------------------------
      // Session anonymous names
      // ------------------------------------------------

      const sessionKey =
        getSessionKey(
          req
        );

      const senderAnonymous =
        getAnonymousName(
          req.user._id,
          sessionKey
        );

      const receiverAnonymous =
        getAnonymousName(
          receiverId,
          sessionKey
        );

      // ------------------------------------------------
      // Safe reply
      // ------------------------------------------------

      let safeReply =
        null;

      if (
        validReplyTo
      ) {
        const reply =
          await Message.findById(
            validReplyTo
          ).lean();

        if (reply) {
          const replyAnonymous =
            getAnonymousName(
              reply.sender,
              sessionKey
            );

          safeReply = {
            _id:
              reply._id,

            anonymousName:
              replyAnonymous,

            message:
              reply.message,

            createdAt:
              reply.createdAt,
          };
        }
      }

      // ------------------------------------------------
      // SAFE RESPONSE
      // ------------------------------------------------
      //
      // Real name and roll number are NEVER returned.
      //
      // ------------------------------------------------

      return res.status(201).json({
        success:
          true,

        message: {
          _id:
            newMessage._id,

          chat:
            newMessage.chat,

          sender: {
            anonymousName:
              senderAnonymous,

            isMe:
              true,
          },

          receiver: {
            anonymousName:
              receiverAnonymous,
          },

          message:
            newMessage.message,

          attachment:
            newMessage.attachment ||
            "",

          replyTo:
            safeReply,

          seen:
            newMessage.seen,

          createdAt:
            newMessage.createdAt,

          updatedAt:
            newMessage.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Server Error",
      });
    }
  };