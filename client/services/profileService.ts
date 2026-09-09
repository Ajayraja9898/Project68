import { API_URL } from "@/lib/api";

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("token") || "";
}

// ==========================================
// Get My Profile
// ==========================================

export async function getMyProfile() {
  try {
    const response = await fetch(`${API_URL}/profile/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    console.log("PROFILE RESPONSE:", data);

    return data;
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    return {
      success: false,
      user: null,
      message: "Unable to load profile",
    };
  }
}
