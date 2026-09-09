import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Invite from "../models/Invite.js";
import Notification from "../models/Notification.js";

// ======================================================
// GET AVAILABLE PARTNERS
// ======================================================
//
// A student is eligible only when:
//
// ✅ Online
// ✅ Available for a new partner
// ✅ Active account
// ✅ Student account
// ✅ Not the current user
// ✅ Not blocked
// ✅ Not already connected to current user
// ✅ Not involved in a pending invitation
// ✅ Not already in another active private chat
//
// IMPORTANT:
// Real names and roll numbers are NEVER returned.
// ======================================================

export const getAvailablePartners = async (
  req,
  res
) => {
  try {
    const currentUserId =
      req.user._id;

    // ==================================================
    // CURRENT USER
    // ==================================================

    const currentUser =
      await User.findById(
        currentUserId
      ).select(
        "_id role accountStatus blockedUsers"
      );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // ==================================================
    // ONLY STUDENTS CAN USE PARTNER MATCHING
    // ==================================================

    if (
      currentUser.role !== "student"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only student accounts can find partners.",
      });
    }

    // ==================================================
    // BLOCKED USERS
    // ==================================================

    const blockedUserIds =
      (
        currentUser.blockedUsers ||
        []
      ).map((id) =>
        id.toString()
      );

    // ==================================================
    // EXISTING CHATS FOR CURRENT USER
    // ==================================================

    const existingChats =
      await Chat.find({
        participants:
          currentUserId,
      }).select(
        "participants status"
      );

    const existingPartnerIds =
      new Set();

    for (
      const chat of existingChats
    ) {
      for (
        const participantId of
          chat.participants
      ) {
        const id =
          participantId.toString();

        if (
          id !==
          currentUserId.toString()
        ) {
          existingPartnerIds.add(
            id
          );
        }
      }
    }

    // ==================================================
    // ALL USERS CURRENTLY IN ACTIVE PRIVATE CHATS
    // ==================================================
    //
    // These users are considered busy for
    // "Find New Partner".
    //
    // Existing chats remain accessible.
    // This only affects new matching.
    // ==================================================

    const activeChats =
      await Chat.find({
        status: "active",
      }).select(
        "participants"
      );

    const usersAlreadyChatting =
      new Set();

    for (
      const chat of activeChats
    ) {
      for (
        const participantId of
          chat.participants
      ) {
        usersAlreadyChatting.add(
          participantId.toString()
        );
      }
    }

    // ==================================================
    // PENDING INVITATIONS
    // ==================================================

    const sentInvites =
      await Invite.find({
        sender:
          currentUserId,

        status:
          "pending",
      }).select(
        "receiver"
      );

    const receivedInvites =
      await Invite.find({
        receiver:
          currentUserId,

        status:
          "pending",
      }).select(
        "sender"
      );

    const pendingUserIds =
      new Set();

    for (
      const invite of sentInvites
    ) {
      pendingUserIds.add(
        invite.receiver.toString()
      );
    }

    for (
      const invite of
        receivedInvites
    ) {
      pendingUserIds.add(
        invite.sender.toString()
      );
    }

    // ==================================================
    // BUILD EXCLUSION LIST
    // ==================================================

    const excludedUserIds =
      new Set([
        currentUserId.toString(),

        ...blockedUserIds,

        ...existingPartnerIds,

        ...pendingUserIds,

        ...usersAlreadyChatting,
      ]);

    // ==================================================
    // FIND ELIGIBLE STUDENTS
    // ==================================================

    const users =
      await User.find({
        isOnline:
          true,

        isAvailableForPartner:
          true,

        accountStatus:
          "active",

        role:
          "student",

        _id: {
          $nin:
            Array.from(
              excludedUserIds
            ),
        },
      })
        .select(
          "_id avatar department year"
        )
        .limit(20);

    // ==================================================
    // SAFE RESPONSE
    // ==================================================
    //
    // NEVER return:
    //
    // ❌ name
    // ❌ rollNumber
    //
    // Only safe profile information.
    // ==================================================

    const partners =
      users.map(
        (user) => ({
          id:
            user._id.toString(),

          anonymousName:
            "Anonymous Partner",

          avatar:
            user.avatar ||
            "",

          department:
            user.department ||
            "",

          year:
            user.year ||
            "",

          isOnline:
            true,
        })
      );

    return res.status(200).json({
      success:
        true,

      count:
        partners.length,

      partners,
    });
  } catch (error) {
    console.error(
      "GET AVAILABLE PARTNERS ERROR:",
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
// SEND PARTNER INVITE
// ======================================================
//
// Frontend sends only partnerId.
//
// The server resolves the real account internally.
//
// The receiver never receives the sender's:
// ❌ Name
// ❌ Roll number
// ❌ Real identity
// ======================================================

export const sendPartnerInvite =
  async (
    req,
    res
  ) => {
    try {
      const {
        partnerId,
      } = req.body;

      const senderId =
        req.user._id;

      // ==================================================
      // VALIDATE PARTNER ID
      // ==================================================

      if (!partnerId) {
        return res.status(400).json({
          success:
            false,

          message:
            "Partner ID is required",
        });
      }

      // ==================================================
      // SENDER MUST BE STUDENT
      // ==================================================

      const sender =
        await User.findById(
          senderId
        ).select(
          "_id role accountStatus blockedUsers"
        );

      if (!sender) {
        return res.status(401).json({
          success:
            false,

          message:
            "User not found",
        });
      }

      if (
        sender.role !==
        "student"
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Only students can find partners.",
        });
      }

      // ==================================================
      // CANNOT INVITE YOURSELF
      // ==================================================

      if (
        senderId.toString() ===
        partnerId.toString()
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "You cannot invite yourself.",
        });
      }

      // ==================================================
      // FIND RECEIVER
      // ==================================================

      const receiver =
        await User.findById(
          partnerId
        ).select(
          "_id role accountStatus isOnline isAvailableForPartner blockedUsers"
        );

      if (!receiver) {
        return res.status(404).json({
          success:
            false,

          message:
            "Partner not found.",
        });
      }

      // ==================================================
      // RECEIVER MUST BE STUDENT
      // ==================================================

      if (
        receiver.role !==
        "student"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "This account is not available for student matching.",
        });
      }

      // ==================================================
      // RECEIVER MUST BE ACTIVE
      // ==================================================

      if (
        receiver.accountStatus !==
        "active"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "This student is not currently available.",
        });
      }

      // ==================================================
      // RECEIVER MUST BE ONLINE + AVAILABLE
      // ==================================================

      if (
        !receiver.isOnline ||
        !receiver.isAvailableForPartner
      ) {
        return res.status(409).json({
          success:
            false,

          message:
            "This student is no longer available.",
        });
      }

      // ==================================================
      // BLOCK CHECK — SENDER BLOCKED RECEIVER
      // ==================================================

      const senderBlocked =
        (
          sender.blockedUsers ||
          []
        ).some(
          (id) =>
            id.toString() ===
            receiver._id.toString()
        );

      if (
        senderBlocked
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "You cannot connect with this student.",
        });
      }

      // ==================================================
      // BLOCK CHECK — RECEIVER BLOCKED SENDER
      // ==================================================

      const receiverBlocked =
        (
          receiver.blockedUsers ||
          []
        ).some(
          (id) =>
            id.toString() ===
            senderId.toString()
        );

      if (
        receiverBlocked
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "You cannot connect with this student.",
        });
      }

      // ==================================================
      // EXISTING ACTIVE CHAT
      // ==================================================

      const existingChat =
        await Chat.findOne({
          participants: {
            $all: [
              senderId,
              receiver._id,
            ],
          },

          status:
            "active",
        });

      if (
        existingChat
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "You already have a private chat with this student.",
        });
      }

      // ==================================================
      // RECEIVER IN ANOTHER ACTIVE CHAT
      // ==================================================
      //
      // Prevent selecting a student who is already busy.
      // ==================================================

      const receiverActiveChat =
        await Chat.findOne({
          participants:
            receiver._id,

          status:
            "active",
        });

      if (
        receiverActiveChat
      ) {
        return res.status(409).json({
          success:
            false,

          message:
            "This student is already connected with another partner.",
        });
      }

      // ==================================================
      // SENDER IN ANOTHER ACTIVE CHAT
      // ==================================================

      const senderActiveChat =
        await Chat.findOne({
          participants:
            senderId,

          status:
            "active",
        });

      if (
        senderActiveChat
      ) {
        return res.status(409).json({
          success:
            false,

          message:
            "You already have an active private partner.",
        });
      }

      // ==================================================
      // PENDING INVITATION EITHER DIRECTION
      // ==================================================

      const existingInvite =
        await Invite.findOne({
          $or: [
            {
              sender:
                senderId,

              receiver:
                receiver._id,
            },

            {
              sender:
                receiver._id,

              receiver:
                senderId,
            },
          ],

          status:
            "pending",
        });

      if (
        existingInvite
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "A pending invitation already exists.",
        });
      }

      // ==================================================
      // CREATE INVITATION
      // ==================================================

      const invite =
        await Invite.create({
          sender:
            senderId,

          receiver:
            receiver._id,

          status:
            "pending",
        });

      // ==================================================
      // SENDER BECOMES UNAVAILABLE
      // ==================================================
      //
      // They are waiting for this invitation to be
      // accepted or declined.
      // ==================================================

      await User.findByIdAndUpdate(
        senderId,
        {
          isAvailableForPartner:
            false,
        }
      );

      // ==================================================
      // ANONYMOUS NOTIFICATION
      // ==================================================

      await Notification.create({
        recipient:
          receiver._id,

        sender:
          senderId,

        type:
          "invite",

        title:
          "New Anonymous Invite",

        message:
          "Someone wants to connect with you.",

        relatedId:
          invite._id,

        isRead:
          false,
      });

      // ==================================================
      // SAFE RESPONSE
      // ==================================================

      return res.status(201).json({
        success:
          true,

        message:
          "Anonymous invitation sent successfully.",

        invite: {
          _id:
            invite._id,

          status:
            invite.status,

          createdAt:
            invite.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "SEND PARTNER INVITE ERROR:",
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