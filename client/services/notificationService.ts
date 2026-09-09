import { API_URL } from "@/lib/api";

// ======================================================
// TYPES
// ======================================================

export interface NotificationItem {
  _id: string;
  recipient?: string;
  sender?: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationResponse {
  success: boolean;
  count?: number;
  notifications: NotificationItem[];
  message?: string;
}

export interface NotificationCountResponse {
  success: boolean;
  count: number;
  message?: string;
}

export interface NotificationActionResponse {
  success: boolean;
  message?: string;
  notification?: {
    _id: string;
    isRead: boolean;
  };
  modifiedCount?: number;
}

// ======================================================
// GET AUTHENTICATION TOKEN
// ======================================================

function getToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("token") || "";
}

// ======================================================
// PARSE RESPONSE SAFELY
// ======================================================

async function parseResponse(
  response: Response
): Promise<any> {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (error) {
      console.error(
        "🔥 JSON RESPONSE PARSE ERROR:",
        error
      );

      return {
        success: false,
        message: "Invalid server response",
      };
    }
  }

  const text = await response.text();

  return {
    success: false,
    message:
      text ||
      `Request failed with status ${response.status}`,
  };
}

// ======================================================
// GET ALL NOTIFICATIONS
// GET /api/notification
// ======================================================

export async function getNotifications(): Promise<NotificationResponse> {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        notifications: [],
        count: 0,
        message: "Authentication token missing",
      };
    }

    const response = await fetch(
      `${API_URL}/notification`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      console.error(
        "❌ GET NOTIFICATIONS STATUS:",
        response.status
      );

      return {
        success: false,
        notifications: [],
        count: 0,
        message:
          data?.message ||
          `Failed to load notifications (${response.status})`,
      };
    }

    return {
      success: Boolean(data?.success),
      count:
        typeof data?.count === "number"
          ? data.count
          : 0,
      notifications:
        Array.isArray(data?.notifications)
          ? data.notifications
          : [],
      message: data?.message,
    };
  } catch (error) {
    console.error(
      "🔥 GET NOTIFICATIONS ERROR:",
      error
    );

    return {
      success: false,
      notifications: [],
      count: 0,
      message: "Unable to load notifications",
    };
  }
}

// ======================================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notification/unread-count
// ======================================================

export async function getUnreadNotificationCount(): Promise<NotificationCountResponse> {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        count: 0,
        message: "Authentication token missing",
      };
    }

    const response = await fetch(
      `${API_URL}/notification/unread-count`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      console.error(
        "❌ GET UNREAD COUNT STATUS:",
        response.status
      );

      return {
        success: false,
        count: 0,
        message:
          data?.message ||
          "Unable to get unread notification count",
      };
    }

    return {
      success: Boolean(data?.success),
      count:
        typeof data?.count === "number"
          ? data.count
          : 0,
      message: data?.message,
    };
  } catch (error) {
    console.error(
      "🔥 GET UNREAD COUNT ERROR:",
      error
    );

    return {
      success: false,
      count: 0,
      message:
        "Unable to get unread notification count",
    };
  }
}

// ======================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notification/:notificationId/read
// ======================================================

export async function markNotificationAsRead(
  notificationId: string
): Promise<NotificationActionResponse> {
  try {
    if (!notificationId) {
      return {
        success: false,
        message: "Notification ID is missing",
      };
    }

    const token = getToken();

    if (!token) {
      return {
        success: false,
        message: "Authentication token missing",
      };
    }

    const response = await fetch(
      `${API_URL}/notification/${encodeURIComponent(
        notificationId
      )}/read`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      console.error(
        "❌ MARK NOTIFICATION READ STATUS:",
        response.status
      );

      return {
        success: false,
        message:
          data?.message ||
          "Unable to mark notification as read",
      };
    }

    return {
      success: Boolean(data?.success),
      message: data?.message,
      notification: data?.notification,
    };
  } catch (error) {
    console.error(
      "🔥 MARK NOTIFICATION READ ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Unable to mark notification as read",
    };
  }
}

// ======================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notification/read-all
// ======================================================

export async function markAllNotificationsAsRead(): Promise<NotificationActionResponse> {
  try {
    const token = getToken();

    if (!token) {
      return {
        success: false,
        message: "Authentication token missing",
      };
    }

    const response = await fetch(
      `${API_URL}/notification/read-all`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      console.error(
        "❌ MARK ALL NOTIFICATIONS READ STATUS:",
        response.status
      );

      return {
        success: false,
        message:
          data?.message ||
          "Unable to mark notifications as read",
      };
    }

    return {
      success: Boolean(data?.success),
      message: data?.message,
      modifiedCount: data?.modifiedCount,
    };
  } catch (error) {
    console.error(
      "🔥 MARK ALL NOTIFICATIONS READ ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Unable to mark notifications as read",
    };
  }
}