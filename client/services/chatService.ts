import { API_URL } from "@/lib/api";

// ======================================================
// TOKEN
// ======================================================

function getToken(): string {
  if (
    typeof window === "undefined"
  ) {
    return "";
  }

  return (
    localStorage.getItem(
      "token"
    ) || ""
  );
}

// ======================================================
// GET ALL CHATS
// ======================================================

export async function getUserChats() {
  const token =
    getToken();

  const response =
    await fetch(
      `${API_URL}/chat`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
          "Content-Type":
            "application/json",
        },

        credentials: "include",

        cache: "no-store",
      }
    );

  return response.json();
}

// ======================================================
// GET SINGLE CHAT
// ======================================================

export async function getChatById(
  chatId: string
) {
  const token =
    getToken();

  const response =
    await fetch(
      `${API_URL}/chat/${encodeURIComponent(
        chatId
      )}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
          "Content-Type":
            "application/json",
        },

        credentials: "include",

        cache: "no-store",
      }
    );

  return response.json();
}

// ======================================================
// UPDATE CHAT RETENTION
// ======================================================

export async function updateChatRetention(
  chatId: string,
  retentionMode:
    | "keep"
    | "24h"
) {
  const token =
    getToken();

  const response =
    await fetch(
      `${API_URL}/chat/${encodeURIComponent(
        chatId
      )}/retention`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        credentials: "include",

        body: JSON.stringify({
          retentionMode,
        }),
      }
    );

  return response.json();
}
