import { API_URL } from "@/lib/api";

function getToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("token") || "";
}

// ======================================================
// SAFE RESPONSE PARSER
// ======================================================

async function parseResponse(response: Response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return {
        success: false,
        message: "Invalid JSON response from server.",
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
// GET MESSAGES
// ======================================================

export async function getMessages(chatId: string) {
  try {
    if (!chatId) {
      return {
        success: false,
        messages: [],
        message: "Chat ID is missing.",
      };
    }

    const response = await fetch(
      `${API_URL}/message/${encodeURIComponent(chatId)}`,
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        
        credentials: "include",
        
        cache: "no-store",
      }
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      return {
        success: false,
        messages: [],
        message:
          data?.message ||
          `Failed to load messages (${response.status})`,
      };
    }

    return data;
  } catch (error) {
    console.error(
      "GET MESSAGES ERROR:",
      error
    );

    return {
      success: false,
      messages: [],
      message: "Unable to load messages.",
    };
  }
}

// ======================================================
// SEND MESSAGE
// ======================================================

export async function sendMessage(
  chatId: string,
  message: string,
  replyTo: string | null = null
) {
  try {
    if (!chatId) {
      return {
        success: false,
        message: "Chat ID is missing.",
      };
    }

    const cleanMessage =
      message.trim();

    if (!cleanMessage) {
      return {
        success: false,
        message: "Message cannot be empty.",
      };
    }

    const response = await fetch(
      `${API_URL}/message`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        
        credentials: "include",

        body: JSON.stringify({
          chatId,
          message: cleanMessage,
          replyTo: replyTo || null,
        }),
      }
    );

    const data =
      await parseResponse(response);

    if (!response.ok) {
      return {
        success: false,
        message:
          data?.message ||
          `Message failed (${response.status})`,
      };
    }

    return data;
  } catch (error) {
    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    return {
      success: false,
      message: "Unable to send message.",
    };
  }
}