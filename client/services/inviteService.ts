import { API_URL } from "@/lib/api";

function getToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("token") || "";
}

// ======================================================
// SEARCH STUDENT BY ROLL NUMBER
// ======================================================

export async function searchStudent(
  rollNumber: string
) {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  const cleanedRollNumber =
    rollNumber.trim().toUpperCase();

  if (!cleanedRollNumber) {
    return {
      success: false,
      message: "Roll Number is required",
    };
  }

  const response = await fetch(
    `${API_URL}/invite/search/${encodeURIComponent(
      cleanedRollNumber
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

// ======================================================
// SEND ANONYMOUS INVITE
// ======================================================

export async function sendInvite(
  rollNumber: string
) {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  const response = await fetch(
    `${API_URL}/invite/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rollNumber:
          rollNumber.trim().toUpperCase(),
      }),
    }
  );

  return response.json();
}

// ======================================================
// GET PENDING INVITES
// ======================================================

export async function getPendingInvites() {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Authentication required",
      invites: [],
    };
  }

  const response = await fetch(
    `${API_URL}/invite/pending`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

// ======================================================
// ACCEPT INVITE
// ======================================================

export async function acceptInvite(
  inviteId: string
) {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  const response = await fetch(
    `${API_URL}/invite/accept/${encodeURIComponent(
      inviteId
    )}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

// ======================================================
// DECLINE INVITE
// ======================================================

export async function declineInvite(
  inviteId: string
) {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  const response = await fetch(
    `${API_URL}/invite/decline/${encodeURIComponent(
      inviteId
    )}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}
