import { API_URL } from "@/lib/api";

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("token") || "";
}

function getHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

// ==========================================
// Community Posts
// ==========================================

export async function getCommunityPosts() {
  try {
    const response = await fetch(
      `${API_URL}/community`,
      {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      }
    );

    return await response.json();
  } catch (error) {
    console.error(
      "GET COMMUNITY POSTS ERROR:",
      error
    );

    return {
      success: false,
      posts: [],
      message: "Unable to load community posts",
    };
  }
}

// ==========================================
// Create Community Post
// ==========================================

export async function createCommunityPost(
  content: string,
  category: string = "General",
  imageUrl: string = ""
) {
  try {
    const response = await fetch(
      `${API_URL}/community`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          content: content.trim(),
          category,
          imageUrl,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error(
      "CREATE COMMUNITY POST ERROR:",
      error
    );

    return {
      success: false,
      message: "Unable to create post",
    };
  }
}

// ==========================================
// Community Comments
// ==========================================

export async function getComments(
  postId: string
) {
  try {
    const response = await fetch(
      `${API_URL}/community/${postId}/comments`,
      {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      }
    );

    return await response.json();
  } catch (error) {
    console.error(
      "GET COMMENTS ERROR:",
      error
    );

    return {
      success: false,
      comments: [],
      message: "Unable to load comments",
    };
  }
}

// ==========================================
// Create Comment
// ==========================================

export async function createComment(
  postId: string,
  content: string,
  imageUrl: string = ""
) {
  try {
    const response = await fetch(
      `${API_URL}/community/${postId}/comments`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          content: content.trim(),
          imageUrl,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error(
      "CREATE COMMENT ERROR:",
      error
    );

    return {
      success: false,
      message: "Unable to create comment",
    };
  }
}

// ==========================================
// Like / Unlike Post
// ==========================================

export async function togglePostLike(
  postId: string
) {
  try {
    const response = await fetch(
      `${API_URL}/community/${postId}/like`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

    return await response.json();
  } catch (error) {
    console.error(
      "POST LIKE ERROR:",
      error
    );

    return {
      success: false,
      message: "Unable to like post",
    };
  }
}

// ==========================================
// Like / Unlike Comment
// ==========================================

export async function toggleCommentLike(
  commentId: string
) {
  try {
    const response = await fetch(
      `${API_URL}/community/comments/${commentId}/like`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

    return await response.json();
  } catch (error) {
    console.error(
      "COMMENT LIKE ERROR:",
      error
    );

    return {
      success: false,
      message: "Unable to like comment",
    };
  }
}

// ==========================================
// Delete Own Post
// ==========================================

export async function deleteCommunityPost(
  postId: string
) {
  try {
    const response = await fetch(
      `${API_URL}/community/${postId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    return await response.json();
  } catch (error) {
    console.error(
      "DELETE POST ERROR:",
      error
    );

    return {
      success: false,
      message: "Unable to delete post",
    };
  }
}

// ==========================================
// Delete Own Comment
// ==========================================

export async function deleteComment(
  commentId: string
) {
  try {
    const response = await fetch(
      `${API_URL}/community/comments/${commentId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    return await response.json();
  } catch (error) {
    console.error(
      "DELETE COMMENT ERROR:",
      error
    );

    return {
      success: false,
      message: "Unable to delete comment",
    };
  }
}

// ======================================================
// COMMUNITY CHAT
// ======================================================

export async function getCommunityMessages() {
  try {
    const response = await fetch(
      `${API_URL}/community/chat/messages`,
      {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      }
    );

    const data = await response.json();

    console.log(
      "GET COMMUNITY CHAT RESPONSE:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "GET COMMUNITY CHAT ERROR:",
      error
    );

    return {
      success: false,
      messages: [],
      message: "Unable to load community chat",
    };
  }
}

export async function sendCommunityChatMessage(
  anonymousName: string,
  message: string,
  imageUrl: string = "",
  replyTo: string | null = null
) {
  try {
    const response = await fetch(
      `${API_URL}/community/chat/messages`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          anonymousName: anonymousName.trim(),
          message: message.trim(),
          imageUrl,
          replyTo,
        }),
      }
    );

    const data = await response.json();

    console.log(
      "SEND COMMUNITY CHAT RESPONSE:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "SEND COMMUNITY CHAT ERROR:",
      error
    );

    return {
      success: false,
      message: "Unable to send community message",
    };
  }
}

export async function deleteCommunityChatMessage(
  messageId: string
) {
  try {
    const response = await fetch(
      `${API_URL}/community/chat/messages/${messageId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    console.log(
      "DELETE COMMUNITY CHAT RESPONSE:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "DELETE COMMUNITY CHAT ERROR:",
      error
    );

    return {
      success: false,
      message: "Unable to delete community message",
    };
  }
}