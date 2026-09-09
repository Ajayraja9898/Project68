import { API_URL } from "@/lib/api";

function getToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("token") || "";
}

// ======================================================
// GET AVAILABLE PARTNERS
// ======================================================

export const getAvailablePartners = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_URL}/partner/available`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch available partners"
    );
  }

  return data;
};

// ======================================================
// SEND PARTNER INVITE
// ======================================================

export const sendPartnerInvite = async (
  partnerId: string
) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  if (!partnerId) {
    throw new Error("Partner ID is required");
  }

  const response = await fetch(
    `${API_URL}/partner/invite`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        partnerId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to send partner invitation"
    );
  }

  return data;
};