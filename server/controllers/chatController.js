import crypto from "crypto";

import Chat from "../models/Chat.js";
import Invite from "../models/Invite.js";

// ======================================================
// GENERATE ANONYMOUS CHAT IDENTITY
// ======================================================
//
// Identity is based on:
//
// current login session + real user ID
//
// Therefore:
//
// Login 1 → SilentFox482
// Login 2 → MysticWolf731
//
// The real name and roll number are NEVER returned
// by the normal chat endpoints.
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
    .update(
      `${sessionKey}:${userId}`
    )
    .digest("hex");

  const adjectiveIndex =
    parseInt(
      hash.substring(0, 8),
      16
    ) %
    adjectives.length;

  const animalIndex =
    parseInt(
      hash.substring(8, 16),
      16
    ) %
    animals.length;

  const number =
    100 +
    (parseInt(
      hash.substring(16, 24),
      16
    ) %
      900);

  return `${adjectives[adjectiveIndex]}${animals[animalIndex]}${number}`;
}

// ======================================================
// GET CURRENT LOGIN SESSION KEY
// ======================================================
//
// We use the JWT sent by the frontend.
//
// A new login creates a new JWT,
// therefore the anonymous identity changes.
//

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
// CREATE SAFE ANONYMOUS PARTICIPANT
// ======================================================
//
// IMPORTANT:
//
// Never return:
//
// ❌ name
// ❌ rollNumber
//
// Only anonymous information is returned.
//

function createAnonymousParticipant(
  participant,
  sessionKey
) {
  return {
    _id: participant._id,

    anonymousName:
      generateAnonymousName(
        sessionKey,
        participant._id.toString()
      ),

    avatar:
      participant.avatar || "",

    department:
      participant.department || "",

    year:
      participant.year || "",
  };
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
    participants: userId,
    status: "active",
  });
}

// ======================================================
// VERIFY ACCEPTED INVITATION
// ======================================================
//
// A private chat is allowed ONLY when an invitation
// between the two users has already been accepted.
//
// It doesn't matter who sent the invitation.
//

async function verifyAcceptedInvite(
  userA,
  userB
) {
  return await Invite.findOne({
    $or: [
      {
        sender: userA,
        receiver: userB,
        status: "accepted",
      },
      {
        sender: userB,
        receiver: userA,
        status: "accepted",
      },
    ],
  });
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
// EXPIRE CHAT
// ======================================================

async function expireChat(chat) {
  chat.status = "closed";

  await chat.save();
}

// ======================================================
// CREATE OR GET PRIVATE CHAT
// ======================================================
//
// SECURITY:
//
// This endpoint CANNOT create a private chat unless
// there is an accepted invitation between the two users.
//
// This prevents:
//
// Student A
//      ↓
// guesses Student B's ID
//      ↓
// POST /api/chat/private
//      ↓
// ❌ rejected
//
// Correct flow:
//
// Invite
//   ↓
// Accept
//   ↓
// Chat
// ======================================================

export const getOrCreateChat = async (
  req,
  res
) => {
  try {
    const {
      receiverId,
    } = req.body;

    const senderId =
      req.user._id;

    // --------------------------------------------------
    // Only students can use private student chat.
    // --------------------------------------------------

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "Only student accounts can use private student chat.",
      });
    }

    // --------------------------------------------------
    // Validate receiver
    // --------------------------------------------------

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver ID is required.",
      });
    }

    // --------------------------------------------------
    // Cannot chat with yourself
    // --------------------------------------------------

    if (
      senderId.toString() ===
      receiverId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot chat with yourself.",
      });
    }

    // --------------------------------------------------
    // ACCEPTED INVITATION REQUIRED
    // --------------------------------------------------

    const acceptedInvite =
      await verifyAcceptedInvite(
        senderId,
        receiverId
      );

    if (!acceptedInvite) {
      return res.status(403).json({
        success: false,
        message:
          "A private chat can only be created after the invitation is accepted.",
      });
    }

    // --------------------------------------------------
    // Find existing chat
    // --------------------------------------------------

    let chat =
      await Chat.findOne({
        participants: {
          $all: [
            senderId,
            receiverId,
          ],
        },
        status: "active",
      });

    // --------------------------------------------------
    // Create chat
    // --------------------------------------------------

    if (!chat) {
      chat =
        await Chat.create({
          participants: [
            senderId,
            receiverId,
          ],

          isAnonymous: true,

          status: "active",

          retentionMode: "keep",

          expiresAt: null,
        });
    }

    // --------------------------------------------------
    // Generate anonymous identities
    // --------------------------------------------------

    const sessionKey =
      getSessionKey(req);

    const populatedChat =
      await Chat.findById(
        chat._id
      ).populate(
        "participants",
        "_id avatar department year"
      );

    if (!populatedChat) {
      return res.status(404).json({
        success: false,
        message:
          "Chat could not be loaded.",
      });
    }

    const safeParticipants =
      populatedChat.participants.map(
        (participant) =>
          createAnonymousParticipant(
            participant,
            sessionKey
          )
      );

    return res.status(200).json({
      success: true,

      chat: {
        _id:
          populatedChat._id,

        participants:
          safeParticipants,

        isAnonymous:
          populatedChat.isAnonymous,

        status:
          populatedChat.status,

        retentionMode:
          populatedChat.retentionMode,

        expiresAt:
          populatedChat.expiresAt,

        lastMessage:
          populatedChat.lastMessage,

        lastActivity:
          populatedChat.lastActivity,

        createdAt:
          populatedChat.createdAt,

        updatedAt:
          populatedChat.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "CREATE CHAT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create private chat.",
    });
  }
};

// ======================================================
// GET ALL CHATS OF LOGGED-IN USER
// ======================================================

export const getUserChats = async (
  req,
  res
) => {
  try {
    const sessionKey =
      getSessionKey(req);

    const chats =
      await Chat.find({
        participants:
          req.user._id,

        status: "active",
      })
        .populate(
          "participants",
          "_id avatar department year"
        )
        .sort({
          lastActivity: -1,
        });

    const safeChats = [];

    for (const chat of chats) {
      // ------------------------------------------------
      // Expiration
      // ------------------------------------------------

      if (
        chatHasExpired(chat)
      ) {
        await expireChat(chat);
        continue;
      }

      // ------------------------------------------------
      // Make sure the chat has an accepted invitation.
      // ------------------------------------------------

      if (
        chat.participants.length !== 2
      ) {
        continue;
      }

      const otherParticipant =
        chat.participants.find(
          (participant) =>
            participant._id.toString() !==
            req.user._id.toString()
        );

      if (!otherParticipant) {
        continue;
      }

      const acceptedInvite =
        await verifyAcceptedInvite(
          req.user._id,
          otherParticipant._id
        );

      if (!acceptedInvite) {
        continue;
      }

      // ------------------------------------------------
      // Anonymous participants
      // ------------------------------------------------

      const safeParticipants =
        chat.participants.map(
          (participant) =>
            createAnonymousParticipant(
              participant,
              sessionKey
            )
        );

      safeChats.push({
        _id:
          chat._id,

        participants:
          safeParticipants,

        isAnonymous:
          chat.isAnonymous,

        status:
          chat.status,

        retentionMode:
          chat.retentionMode,

        expiresAt:
          chat.expiresAt,

        lastMessage:
          chat.lastMessage,

        lastActivity:
          chat.lastActivity,

        createdAt:
          chat.createdAt,

        updatedAt:
          chat.updatedAt,
      });
    }

    return res.status(200).json({
      success: true,

      count:
        safeChats.length,

      chats:
        safeChats,
    });
  } catch (error) {
    console.error(
      "GET USER CHATS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load chats.",
    });
  }
};

// ======================================================
// GET SINGLE CHAT
// ======================================================

export const getChatById = async (
  req,
  res
) => {
  try {
    const {
      chatId,
    } = req.params;

    const sessionKey =
      getSessionKey(req);

    // --------------------------------------------------
    // Find chat
    // --------------------------------------------------

    const chat =
      await Chat.findById(
        chatId
      ).populate(
        "participants",
        "_id avatar department year"
      );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message:
          "Chat not found.",
      });
    }

    // --------------------------------------------------
    // Verify current user
    // --------------------------------------------------

    const isParticipant =
      chat.participants.some(
        (participant) =>
          participant._id
            .toString() ===
          req.user._id.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant of this chat.",
      });
    }

    // --------------------------------------------------
    // Find other participant
    // --------------------------------------------------

    const otherParticipant =
      chat.participants.find(
        (participant) =>
          participant._id
            .toString() !==
          req.user._id.toString()
      );

    if (!otherParticipant) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid private chat.",
      });
    }

    // --------------------------------------------------
    // ACCEPTED INVITATION REQUIRED
    // --------------------------------------------------

    const acceptedInvite =
      await verifyAcceptedInvite(
        req.user._id,
        otherParticipant._id
      );

    if (!acceptedInvite) {
      return res.status(403).json({
        success: false,
        message:
          "Private chat access requires an accepted invitation.",
      });
    }

    // --------------------------------------------------
    // Check expiration
    // --------------------------------------------------

    if (
      chatHasExpired(chat)
    ) {
      await expireChat(chat);

      return res.status(410).json({
        success: false,
        message:
          "This chat has expired.",
      });
    }

    // --------------------------------------------------
    // Anonymous participants
    // --------------------------------------------------

    const safeParticipants =
      chat.participants.map(
        (participant) =>
          createAnonymousParticipant(
            participant,
            sessionKey
          )
      );

    return res.status(200).json({
      success: true,

      chat: {
        _id:
          chat._id,

        participants:
          safeParticipants,

        isAnonymous:
          chat.isAnonymous,

        status:
          chat.status,

        retentionMode:
          chat.retentionMode,

        expiresAt:
          chat.expiresAt,

        lastMessage:
          chat.lastMessage,

        lastActivity:
          chat.lastActivity,

        createdAt:
          chat.createdAt,

        updatedAt:
          chat.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "GET CHAT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load chat.",
    });
  }
};

// ======================================================
// CHANGE CHAT RETENTION MODE
// ======================================================

export const updateChatDeletionMode =
  async (req, res) => {
    try {
      const {
        chatId,
      } = req.params;

      const {
        retentionMode,
      } = req.body;

      // ------------------------------------------------
      // Validate
      // ------------------------------------------------

      if (
        !["keep", "24h"].includes(
          retentionMode
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            'retentionMode must be "keep" or "24h".',
        });
      }

      // ------------------------------------------------
      // Find chat
      // ------------------------------------------------

      const chat =
        await Chat.findById(
          chatId
        );

      if (!chat) {
        return res.status(404).json({
          success: false,
          message:
            "Chat not found.",
        });
      }

      // ------------------------------------------------
      // Security
      // ------------------------------------------------

      const isParticipant =
        chat.participants.some(
          (participantId) =>
            participantId
              .toString() ===
            req.user._id.toString()
        );

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a participant of this chat.",
        });
      }

      // ------------------------------------------------
      // Verify accepted invitation
      // ------------------------------------------------

      const otherParticipantId =
        chat.participants.find(
          (participantId) =>
            participantId
              .toString() !==
            req.user._id.toString()
        );

      if (!otherParticipantId) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid private chat.",
        });
      }

      const acceptedInvite =
        await verifyAcceptedInvite(
          req.user._id,
          otherParticipantId
        );

      if (!acceptedInvite) {
        return res.status(403).json({
          success: false,
          message:
            "Chat requires an accepted invitation.",
        });
      }

      // ------------------------------------------------
      // Update retention
      // ------------------------------------------------

      chat.retentionMode =
        retentionMode;

      if (
        retentionMode === "24h"
      ) {
        chat.expiresAt =
          new Date(
            Date.now() +
              24 *
                60 *
                60 *
                1000
          );
      } else {
        chat.expiresAt = null;
      }

      await chat.save();

      return res.status(200).json({
        success: true,

        message:
          retentionMode === "24h"
            ? "Chat messages will expire after 24 hours."
            : "Chat messages will remain permanently.",

        retentionMode:
          chat.retentionMode,

        expiresAt:
          chat.expiresAt,
      });
    } catch (error) {
      console.error(
        "UPDATE CHAT RETENTION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update chat retention.",
      });
    }
  };