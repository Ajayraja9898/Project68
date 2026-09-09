import User from "../models/User.js";
import Invite from "../models/Invite.js";
import Chat from "../models/Chat.js";
import Notification from "../models/Notification.js";

// ======================================================
// SEARCH STUDENT BY ROLL NUMBER
// ======================================================
//
// The roll number is used only as a lookup key.
//
// NEVER return:
//   - name
//   - rollNumber
//   - password
//
// Admin accounts are never searchable through this
// student private-chat search.
// ======================================================

export const searchStudent = async (req, res) => {
  try {
    const { rollNumber } = req.params;

    if (!rollNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Roll Number is required",
      });
    }

    const student = await User.findOne({
      rollNumber: rollNumber.trim().toUpperCase(),
      role: "student",
      accountStatus: "active",
    }).select(
      "_id avatar department year"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // --------------------------------------------------
    // Prevent searching yourself
    // --------------------------------------------------

    if (
      student._id.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot search yourself.",
      });
    }

    // --------------------------------------------------
    // SAFE RESPONSE
    // --------------------------------------------------
    //
    // The searched student's real identity is never
    // returned.
    //
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      student: {
        id: student._id.toString(),

        avatar:
          student.avatar || "",

        department:
          student.department || "",

        year:
          student.year || "",
      },
    });
  } catch (error) {
    console.error(
      "SEARCH STUDENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================================
// SEND INVITE BY ROLL NUMBER
// ======================================================
//
// The sender provides the roll number only to the
// server.
//
// The receiver never sees the sender's:
//   - real name
//   - roll number
//
// ======================================================

export const sendInvite = async (req, res) => {
  try {
    const {
      rollNumber,
    } = req.body;

    const senderId =
      req.user._id;

    // ==================================================
    // VALIDATE ROLL NUMBER
    // ==================================================

    if (!rollNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Roll Number is required",
      });
    }

    // ==================================================
    // SENDER MUST BE STUDENT
    // ==================================================

    if (
      req.user.role !==
      "student"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only students can send private-chat invitations.",
      });
    }

    // ==================================================
    // FIND RECEIVER INTERNALLY
    // ==================================================

    const receiver =
      await User.findOne({
        rollNumber:
          rollNumber
            .trim()
            .toUpperCase(),

        role: "student",

        accountStatus:
          "active",
      }).select(
        "_id role accountStatus blockedUsers"
      );

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found",
      });
    }

    // ==================================================
    // CANNOT INVITE YOURSELF
    // ==================================================

    if (
      receiver._id.toString() ===
      senderId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot invite yourself.",
      });
    }

    // ==================================================
    // BLOCK CHECK — SENDER BLOCKED RECEIVER
    // ==================================================

    const senderBlocked =
      (
        req.user.blockedUsers ||
        []
      ).some(
        (id) =>
          id.toString() ===
          receiver._id.toString()
      );

    if (senderBlocked) {
      return res.status(403).json({
        success: false,
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

    if (receiverBlocked) {
      return res.status(403).json({
        success: false,
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

    if (existingChat) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a private chat with this student.",
      });
    }

    // ==================================================
    // PENDING INVITE EITHER DIRECTION
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

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message:
          "A pending invitation already exists.",
      });
    }

    // ==================================================
    // CREATE INVITE
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
    // SENDER TEMPORARILY UNAVAILABLE
    // ==================================================
    //
    // The sender is waiting for this invitation to
    // be accepted or declined.
    //
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
    //
    // The sender reference is stored internally.
    // The notification shown to the student contains
    // no real identity.
    //
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
        "Anonymous invite sent successfully.",

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
      "SEND INVITE ERROR:",
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
// GET PENDING INVITES
// ======================================================
//
// IMPORTANT:
//
// Do NOT populate sender information here.
//
// The receiver must never see the sender's:
//   - name
//   - roll number
//
// ======================================================

export const getPendingInvites =
  async (
    req,
    res
  ) => {
    try {
      const invites =
        await Invite.find({
          receiver:
            req.user._id,

          status:
            "pending",
        })
          .select(
            "_id status createdAt"
          )
          .sort({
            createdAt:
              -1,
          });

      const safeInvites =
        invites.map(
          (invite) => ({
            _id:
              invite._id,

            status:
              invite.status,

            createdAt:
              invite.createdAt,

            anonymous:
              true,
          })
        );

      return res.status(200).json({
        success:
          true,

        count:
          safeInvites.length,

        invites:
          safeInvites,
      });
    } catch (error) {
      console.error(
        "GET INVITES ERROR:",
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
// ACCEPT INVITE
// ======================================================
//
// Receiver accepts.
//
// Then:
//
// Invite
//   ↓
// Accepted
//   ↓
// Chat created
//
// Both users become unavailable for NEW partner
// matching while this active private chat exists.
//
// ======================================================

export const acceptInvite =
  async (
    req,
    res
  ) => {
    try {
      const {
        inviteId,
      } = req.params;

      const invite =
        await Invite.findById(
          inviteId
        );

      if (!invite) {
        return res.status(404).json({
          success:
            false,

          message:
            "Invite not found",
        });
      }

      // ==================================================
      // ONLY RECEIVER CAN ACCEPT
      // ==================================================

      if (
        invite.receiver.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Unauthorized",
        });
      }

      // ==================================================
      // INVITE MUST BE PENDING
      // ==================================================

      if (
        invite.status !==
        "pending"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invite already processed",
        });
      }

      // ==================================================
      // RE-CHECK USERS
      // ==================================================

      const sender =
        await User.findById(
          invite.sender
        ).select(
          "_id role accountStatus blockedUsers"
        );

      const receiver =
        await User.findById(
          invite.receiver
        ).select(
          "_id role accountStatus blockedUsers"
        );

      if (
        !sender ||
        !receiver ||
        sender.role !==
          "student" ||
        receiver.role !==
          "student" ||
        sender.accountStatus !==
          "active" ||
        receiver.accountStatus !==
          "active"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "This invitation is no longer valid.",
        });
      }

      // ==================================================
      // BLOCK CHECK AGAIN
      // ==================================================

      const senderBlockedReceiver =
        (
          sender.blockedUsers ||
          []
        ).some(
          (id) =>
            id.toString() ===
            receiver._id.toString()
        );

      const receiverBlockedSender =
        (
          receiver.blockedUsers ||
          []
        ).some(
          (id) =>
            id.toString() ===
            sender._id.toString()
        );

      if (
        senderBlockedReceiver ||
        receiverBlockedSender
      ) {
        invite.status =
          "declined";

        await invite.save();

        await User.findByIdAndUpdate(
          sender._id,
          {
            isAvailableForPartner:
              true,
          }
        );

        return res.status(403).json({
          success:
            false,

          message:
            "This invitation can no longer be accepted.",
        });
      }

      // ==================================================
      // MARK ACCEPTED
      // ==================================================

      invite.status =
        "accepted";

      await invite.save();

      // ==================================================
      // FIND EXISTING ACTIVE CHAT
      // ==================================================

      let chat =
        await Chat.findOne({
          participants: {
            $all: [
              invite.sender,
              invite.receiver,
            ],
          },

          status:
            "active",
        });

      // ==================================================
      // CREATE CHAT
      // ==================================================

      if (!chat) {
        chat =
          await Chat.create({
            participants: [
              invite.sender,
              invite.receiver,
            ],

            anonymousIdentities:
              [],

            isAnonymous:
              true,

            status:
              "active",

            retentionMode:
              "keep",

            expiresAt:
              null,
          });
      }

      // ==================================================
      // BOTH USERS NOW BUSY
      // ==================================================

      await User.updateMany(
        {
          _id: {
            $in: [
              invite.sender,
              invite.receiver,
            ],
          },
        },
        {
          isAvailableForPartner:
            false,
        }
      );

      // ==================================================
      // ANONYMOUS ACCEPTED NOTIFICATION
      // ==================================================

      await Notification.create({
        recipient:
          invite.sender,

        sender:
          invite.receiver,

        type:
          "invite_accepted",

        title:
          "Anonymous Invite Accepted",

        message:
          "Your anonymous invitation was accepted.",

        relatedId:
          chat._id,

        isRead:
          false,
      });

      // ==================================================
      // SAFE RESPONSE
      // ==================================================

      return res.status(200).json({
        success:
          true,

        message:
          "Invite accepted successfully.",

        chatId:
          chat._id.toString(),
      });
    } catch (error) {
      console.error(
        "ACCEPT INVITE ERROR:",
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
// DECLINE INVITE
// ======================================================
//
// Sender becomes available again.
//
// Receiver remains available.
//
// ======================================================

export const declineInvite =
  async (
    req,
    res
  ) => {
    try {
      const {
        inviteId,
      } = req.params;

      const invite =
        await Invite.findById(
          inviteId
        );

      if (!invite) {
        return res.status(404).json({
          success:
            false,

          message:
            "Invite not found",
        });
      }

      // ==================================================
      // ONLY RECEIVER CAN DECLINE
      // ==================================================

      if (
        invite.receiver.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success:
            false,

          message:
            "Unauthorized",
        });
      }

      // ==================================================
      // MUST BE PENDING
      // ==================================================

      if (
        invite.status !==
        "pending"
      ) {
        return res.status(400).json({
          success:
            false,

          message:
            "Invite already processed",
        });
      }

      // ==================================================
      // DECLINE
      // ==================================================

      invite.status =
        "declined";

      await invite.save();

      // ==================================================
      // SENDER AVAILABLE AGAIN
      // ==================================================

      await User.findByIdAndUpdate(
        invite.sender,
        {
          isAvailableForPartner:
            true,
        }
      );

      // ==================================================
      // ANONYMOUS NOTIFICATION
      // ==================================================

      await Notification.create({
        recipient:
          invite.sender,

        sender:
          invite.receiver,

        type:
          "invite_declined",

        title:
          "Anonymous Invite Declined",

        message:
          "Your anonymous invitation was declined.",

        relatedId:
          invite._id,

        isRead:
          false,
      });

      return res.status(200).json({
        success:
          true,

        message:
          "Anonymous invitation declined.",
      });
    } catch (error) {
      console.error(
        "DECLINE INVITE ERROR:",
        error
      );

      return res.status(500).json({
        success:
          false,

        message:
          "Unable to decline invitation.",
      });
    }
  };