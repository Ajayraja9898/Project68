import Notification from "../models/Notification.js";

// ==========================================
// SAFE NOTIFICATION RESPONSE
// ==========================================
//
// Never populate or expose private User information
// automatically.
//
// The frontend only receives the notification fields
// it actually needs.
//

function safeNotification(notification) {
  if (!notification) {
    return null;
  }

  return {
    _id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    relatedId: notification.relatedId || null,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

// ==========================================
// CREATE NOTIFICATION
// ==========================================
//
// This helper is intentionally NOT an Express route.
//
// Other controllers such as:
// - inviteController.js
// - messageController.js
// - achievementController.js
//
// can import this function and create notifications.
//
// Example:
//
// await createNotification({
//   recipient: userId,
//   sender: req.user._id,
//   type: "invite",
//   title: "New Anonymous Invite",
//   message: "Someone sent you an anonymous invite.",
//   relatedId: invite._id,
// });
//
// ==========================================

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  relatedId = null,
}) => {
  try {
    // ------------------------------------------
    // Required fields
    // ------------------------------------------

    if (!recipient) {
      console.error(
        "CREATE NOTIFICATION: RECIPIENT MISSING"
      );

      return null;
    }

    if (!type) {
      console.error(
        "CREATE NOTIFICATION: TYPE MISSING"
      );

      return null;
    }

    if (!title) {
      console.error(
        "CREATE NOTIFICATION: TITLE MISSING"
      );

      return null;
    }

    if (!message) {
      console.error(
        "CREATE NOTIFICATION: MESSAGE MISSING"
      );

      return null;
    }

    // ------------------------------------------
    // Create notification
    // ------------------------------------------

    const notification =
      await Notification.create({
        recipient,
        sender,
        type,
        title: String(title).trim(),
        message: String(message).trim(),
        relatedId,
      });

    console.log(
      "🔔 NOTIFICATION CREATED:",
      notification._id
    );

    console.log(
      "🔔 NOTIFICATION TYPE:",
      notification.type
    );

    console.log(
      "🔔 NOTIFICATION RECIPIENT:",
      recipient
    );

    return notification;
  } catch (error) {
    console.error(
      "CREATE NOTIFICATION ERROR:"
    );

    console.error(error);

    // ------------------------------------------
    // IMPORTANT
    // ------------------------------------------
    //
    // Notification failure should NOT normally
    // break the main action.
    //
    // For example, if an invite is successfully
    // created but notification creation fails,
    // the invite should still remain successful.
    //
    // ------------------------------------------

    return null;
  }
};

// ==========================================
// GET USER NOTIFICATIONS
// ==========================================
//
// GET /api/notification
//
// Protected route.
//
// Returns only notifications belonging to
// the currently authenticated user.
//
// ==========================================

export const getNotifications = async (
  req,
  res
) => {
  try {
    // ------------------------------------------
    // Verify authenticated user
    // ------------------------------------------

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    // ------------------------------------------
    // Get notifications
    // ------------------------------------------

    const notifications =
      await Notification.find({
        recipient: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // ------------------------------------------
    // Safe response
    // ------------------------------------------

    const safeNotifications =
      notifications.map(
        safeNotification
      );

    return res.status(200).json({
      success: true,

      count:
        safeNotifications.length,

      notifications:
        safeNotifications,
    });
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================
// GET UNREAD NOTIFICATION COUNT
// ==========================================
//
// GET /api/notification/unread-count
//
// Protected route.
//
// ==========================================

export const getUnreadNotificationCount =
  async (req, res) => {
    try {
      // ----------------------------------------
      // Verify authenticated user
      // ----------------------------------------

      if (!req.user?._id) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      // ----------------------------------------
      // Count unread notifications
      // ----------------------------------------

      const count =
        await Notification.countDocuments({
          recipient: req.user._id,

          isRead: false,
        });

      return res.status(200).json({
        success: true,
        count,
      });
    } catch (error) {
      console.error(
        "GET UNREAD NOTIFICATION COUNT ERROR:"
      );

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================
//
// PATCH /api/notification/:notificationId/read
//
// Protected route.
//
// A user can ONLY modify their own notification.
//
// ==========================================

export const markNotificationAsRead =
  async (req, res) => {
    try {
      const { notificationId } =
        req.params;

      // ----------------------------------------
      // Validate authentication
      // ----------------------------------------

      if (!req.user?._id) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      // ----------------------------------------
      // Validate notification ID
      // ----------------------------------------

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message:
            "Notification ID is required",
        });
      }

      // ----------------------------------------
      // Find notification
      // ----------------------------------------
      //
      // IMPORTANT:
      //
      // recipient MUST match the current user.
      //
      // This prevents one user from marking
      // another user's notification as read.
      //
      // ----------------------------------------

      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: notificationId,

            recipient:
              req.user._id,
          },

          {
            $set: {
              isRead: true,
            },
          },

          {
            new: true,
          }
        ).lean();

      // ----------------------------------------
      // Notification not found
      // ----------------------------------------

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      // ----------------------------------------
      // Response
      // ----------------------------------------

      return res.status(200).json({
        success: true,

        message:
          "Notification marked as read.",

        notification:
          safeNotification(
            notification
          ),
      });
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:"
      );

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================
//
// PATCH /api/notification/read-all
//
// Protected route.
//
// Marks ONLY the current user's notifications
// as read.
//
// ==========================================

export const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      // ----------------------------------------
      // Verify authentication
      // ----------------------------------------

      if (!req.user?._id) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      // ----------------------------------------
      // Update unread notifications
      // ----------------------------------------

      const result =
        await Notification.updateMany(
          {
            recipient:
              req.user._id,

            isRead: false,
          },

          {
            $set: {
              isRead: true,
            },
          }
        );

      // ----------------------------------------
      // Response
      // ----------------------------------------

      return res.status(200).json({
        success: true,

        message:
          "All notifications marked as read.",

        modifiedCount:
          result.modifiedCount,
      });
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS READ ERROR:"
      );

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };