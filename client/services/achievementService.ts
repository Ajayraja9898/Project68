import { API_URL } from "@/lib/api";

function getToken(): string {
  if (
    typeof window ===
    "undefined"
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
// GET ALL ACHIEVEMENTS
// ======================================================

export async function getAchievements() {
  const token =
    getToken();

  const response =
    await fetch(
      `${API_URL}/achievement`,
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        cache:
          "no-store",
      }
    );

  return response.json();
}

// ======================================================
// GET ONE ACHIEVEMENT
// ======================================================

export async function getAchievementById(
  achievementId: string
) {
  const token =
    getToken();

  const response =
    await fetch(
      `${API_URL}/achievement/${encodeURIComponent(
        achievementId
      )}`,
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        cache:
          "no-store",
      }
    );

  return response.json();
}
