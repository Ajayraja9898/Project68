"use client";

import { API_URL } from "@/lib/api";
import { useEffect, useState } from "react";

// ======================================================
// TYPES
// ======================================================

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  onlineUsers: number;
  suspendedUsers: number;
  activeChats: number;
  communityMessages: number;
}

interface AdminUser {
  _id: string;
  name: string;
  rollNumber: string;
  avatar?: string;
  role: "student" | "admin";
  department?: string;
  year?: number;
  isOnline: boolean;
  lastSeen?: string;
  xp?: number;
  level?: number;
  streak?: number;
  achievements?: string[];
  accountStatus: "active" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

interface CommunityAuthor {
  _id: string;
  name: string;
  rollNumber: string;
  avatar?: string;
  role?: string;
  department?: string;
  year?: number;
  accountStatus?: "active" | "suspended";
  isOnline?: boolean;
  lastSeen?: string | null;
}

interface CommunityPost {
  _id: string;
  anonymousName: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  likes?: number;
  isRemoved: boolean;
  removedByAdmin?: CommunityAuthor | null;
  author?: CommunityAuthor | null;
  createdAt?: string;
  updatedAt?: string;
}

interface CommunityComment {
  _id: string;
  anonymousName: string;
  content?: string;
  imageUrl?: string;
  likes?: number;
  isRemoved: boolean;
  removedByAdmin?: CommunityAuthor | null;
  author?: CommunityAuthor | null;
  post?: {
    _id: string;
    anonymousName?: string;
    content?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminChatParticipant {
  _id: string;
  name: string;
  rollNumber: string;
  avatar?: string;
  department?: string;
  year?: number;
  role?: string;
  accountStatus?: "active" | "suspended";
  isOnline?: boolean;
  lastSeen?: string | null;
}

interface AnonymousIdentity {
  user: string;
  anonymousName: string;
}

interface AdminChat {
  _id: string;
  status: "active" | "closed";
  isAnonymous: boolean;
  retentionMode: "keep" | "24h";
  expiresAt?: string | null;
  lastMessage?: string;
  lastActivity?: string;
  createdAt?: string;
  updatedAt?: string;
  anonymousIdentities?: AnonymousIdentity[];
  participants: AdminChatParticipant[];
}

interface AdminChatMessage {
  _id: string;
  message: string;
  attachment?: string;
  seen?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  sender?: {
    _id: string;
    name: string;
    rollNumber: string;
    role?: string;
  } | null;
  receiver?: {
    _id: string;
    name: string;
    rollNumber: string;
    role?: string;
  } | null;
  replyTo?: {
    _id: string;
    message: string;
    createdAt?: string;
    isDeleted?: boolean;
  } | null;
}

interface AdminChatDetail {
  _id: string;
  status: "active" | "closed";
  isAnonymous: boolean;
  retentionMode: "keep" | "24h";
  expiresAt?: string | null;
  lastMessage?: string;
  lastActivity?: string;
  createdAt?: string;
  updatedAt?: string;
  anonymousIdentities?: AnonymousIdentity[];
  participants: AdminChatParticipant[];
}

interface CommunityChatReply {
  _id: string;
  anonymousName?: string;
  message?: string;
  imageUrl?: string;
  authorId?: string | null;
  createdAt?: string;
  retention?: "24h" | "never";
  expiresAt?: string | null;
}

interface AdminCommunityMessage {
  _id: string;
  anonymousName: string;
  author?: CommunityAuthor | null;
  message?: string;
  imageUrl?: string;
  replyTo?: CommunityChatReply | null;
  retention: "24h" | "never";
  expiresAt?: string | null;
  isExpired?: boolean;
  isDeleted: boolean;
  deletedByAdmin: boolean;
  deletedBy?: CommunityAuthor | null;
  createdAt?: string;
  updatedAt?: string;
}

// ======================================================
// ADMIN PAGE
// ======================================================

export default function AdminPage() {
  const [stats, setStats] =
    useState<AdminStats | null>(null);

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [posts, setPosts] =
    useState<CommunityPost[]>([]);

  const [comments, setComments] =
    useState<CommunityComment[]>([]);

  const [chats, setChats] =
    useState<AdminChat[]>([]);

  const [selectedChat, setSelectedChat] =
    useState<AdminChatDetail | null>(null);

  const [chatMessages, setChatMessages] =
    useState<AdminChatMessage[]>([]);

  const [communityMessages, setCommunityMessages] =
    useState<AdminCommunityMessage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [moderationLoading, setModerationLoading] =
    useState(true);

  const [chatLoading, setChatLoading] =
    useState(false);

  const [communityChatLoading, setCommunityChatLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [moderationError, setModerationError] =
    useState("");

  const [chatError, setChatError] =
    useState("");

  const [communityChatError, setCommunityChatError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState("");

  // ======================================================
  // TOKEN
  // ======================================================

  const getToken = () => {
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
  };

  // ======================================================
  // UNAUTHORIZED
  // ======================================================

  const handleUnauthorized = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    alert(
      "You are not authorized to access the admin panel."
    );

    window.location.href = "/";
  };

  // ======================================================
  // LOAD ADMIN DASHBOARD + USERS
  // ======================================================

  const loadAdminData =
    async () => {
      try {
        setLoading(true);

        setError("");

        const token =
          getToken();

        if (!token) {
          window.location.href =
            "/";

          return;
        }

        // ==================================================
        // DASHBOARD
        // ==================================================

        const statsResponse =
          await fetch(
            `${API_URL}/admin/dashboard`,
            {
              method:
                "GET",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              cache:
                "no-store",
            }
          );

        const statsData =
          await statsResponse.json();

        if (
          !statsResponse.ok
        ) {
          if (
            statsResponse.status ===
              401 ||
            statsResponse.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            statsData?.message ||
              "Failed to load admin dashboard."
          );
        }

        setStats({
          totalUsers:
            statsData?.stats
              ?.totalUsers ??
            0,

          totalStudents:
            statsData?.stats
              ?.totalStudents ??
            0,

          totalAdmins:
            statsData?.stats
              ?.totalAdmins ??
            0,

          onlineUsers:
            statsData?.stats
              ?.onlineUsers ??
            0,

          suspendedUsers:
            statsData?.stats
              ?.suspendedUsers ??
            0,

          activeChats:
            statsData?.stats
              ?.activeChats ??
            0,

          communityMessages:
            statsData?.stats
              ?.communityMessages ??
            0,
        });

        // ==================================================
        // USERS
        // ==================================================

        const usersResponse =
          await fetch(
            `${API_URL}/admin/users`,
            {
              method:
                "GET",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              cache:
                "no-store",
            }
          );

        const usersData =
          await usersResponse.json();

        if (
          !usersResponse.ok
        ) {
          if (
            usersResponse.status ===
              401 ||
            usersResponse.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            usersData?.message ||
              "Failed to load users."
          );
        }

        setUsers(
          Array.isArray(
            usersData?.users
          )
            ? usersData.users
            : []
        );
      } catch (err) {
        console.error(
          "ADMIN DASHBOARD ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load admin dashboard."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // ======================================================
  // LOAD COMMUNITY POSTS + COMMENTS
  // ======================================================
  //
  // These endpoints are served by the community routes.
  // ======================================================

  const loadModerationData =
    async () => {
      try {
        setModerationLoading(
          true
        );

        setModerationError("");

        const token =
          getToken();

        if (!token) {
          return;
        }

        // --------------------------------------------------
        // ADMIN POSTS
        // --------------------------------------------------

        const postsResponse =
          await fetch(
            `${API_URL}/community/admin/posts`,
            {
              method:
                "GET",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              cache:
                "no-store",
            }
          );

        const postsData =
          await postsResponse.json();

        if (
          !postsResponse.ok
        ) {
          if (
            postsResponse.status ===
              401 ||
            postsResponse.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            postsData?.message ||
              "Failed to load community posts."
          );
        }

        setPosts(
          Array.isArray(
            postsData?.posts
          )
            ? postsData.posts
            : []
        );

        // --------------------------------------------------
        // ADMIN COMMENTS
        // --------------------------------------------------

        const commentsResponse =
          await fetch(
            `${API_URL}/community/admin/comments`,
            {
              method:
                "GET",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              cache:
                "no-store",
            }
          );

        const commentsData =
          await commentsResponse.json();

        if (
          !commentsResponse.ok
        ) {
          if (
            commentsResponse.status ===
              401 ||
            commentsResponse.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            commentsData?.message ||
              "Failed to load community comments."
          );
        }

        setComments(
          Array.isArray(
            commentsData?.comments
          )
            ? commentsData.comments
            : []
        );
      } catch (err) {
        console.error(
          "ADMIN MODERATION ERROR:",
          err
        );

        setModerationError(
          err instanceof Error
            ? err.message
            : "Failed to load moderation data."
        );
      } finally {
        setModerationLoading(
          false
        );
      }
    };

  // ======================================================
  // LOAD PRIVATE CHATS
  // ======================================================

  const loadAdminChats =
    async () => {
      try {
        setChatError("");

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/admin/chats`,
            {
              method:
                "GET",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            data?.message ||
              "Failed to load private chats."
          );
        }

        setChats(
          Array.isArray(
            data?.chats
          )
            ? data.chats
            : []
        );
      } catch (err) {
        console.error(
          "ADMIN CHATS ERROR:",
          err
        );

        setChatError(
          err instanceof Error
            ? err.message
            : "Failed to load private chats."
        );
      }
    };

  // ======================================================
  // LOAD ONE PRIVATE CHAT
  // ======================================================

  const loadAdminChat =
    async (
      chatId: string
    ) => {
      try {
        setChatLoading(
          true
        );

        setChatError("");

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/admin/chats/${chatId}`,
            {
              method:
                "GET",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            data?.message ||
              "Failed to load private chat."
          );
        }

        setSelectedChat(
          data?.chat ||
            null
        );

        setChatMessages(
          Array.isArray(
            data?.messages
          )
            ? data.messages
            : []
        );
      } catch (err) {
        console.error(
          "ADMIN CHAT DETAIL ERROR:",
          err
        );

        setChatError(
          err instanceof Error
            ? err.message
            : "Failed to load private chat."
        );
      } finally {
        setChatLoading(
          false
        );
      }
    };

  // ======================================================
  // LOAD COMMUNITY CHAT
  // ======================================================

  const loadAdminCommunityMessages =
    async () => {
      try {
        setCommunityChatLoading(
          true
        );

        setCommunityChatError("");

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/admin/community-chat`,
            {
              method:
                "GET",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            data?.message ||
              "Failed to load community chat."
          );
        }

        setCommunityMessages(
          Array.isArray(
            data?.messages
          )
            ? data.messages
            : []
        );
      } catch (err) {
        console.error(
          "ADMIN COMMUNITY CHAT ERROR:",
          err
        );

        setCommunityChatError(
          err instanceof Error
            ? err.message
            : "Failed to load community chat."
        );
      } finally {
        setCommunityChatLoading(
          false
        );
      }
    };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadAdminData();

    loadModerationData();

    loadAdminChats();

    loadAdminCommunityMessages();
  }, []);

  // ======================================================
  // SUSPEND / UNSUSPEND
  // ======================================================

  const handleAccountStatus =
    async (
      user: AdminUser
    ) => {
      if (
        user.role ===
        "admin"
      ) {
        return;
      }

      const isSuspended =
        user.accountStatus ===
        "suspended";

      const action =
        isSuspended
          ? "unsuspend"
          : "suspend";

      const confirmed =
        window.confirm(
          isSuspended
            ? `Unsuspend ${user.name}?`
            : `Suspend ${user.name}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          user._id
        );

        const token =
          getToken();

        if (!token) {
          window.location.href =
            "/";

          return;
        }

        const response =
          await fetch(
            `${API_URL}/admin/users/${user._id}/${action}`,
            {
              method:
                "PATCH",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            data?.message ||
              `Unable to ${action} user.`
          );
        }

        await loadAdminData();

        await loadAdminChats();
      } catch (err) {
        console.error(
          "ACCOUNT STATUS ERROR:",
          err
        );

        alert(
          err instanceof Error
            ? err.message
            : `Unable to ${action} user.`
        );
      } finally {
        setActionLoading(
          ""
        );
      }
    };

  // ======================================================
  // COMMUNITY POST MODERATION
  // ======================================================

  const handlePostModeration =
    async (
      post: CommunityPost
    ) => {
      const action =
        post.isRemoved
          ? "restore"
          : "remove";

      const confirmed =
        window.confirm(
          post.isRemoved
            ? "Restore this community post?"
            : "Remove this community post?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `post-${post._id}`
        );

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/community/admin/posts/${post._id}${
              action ===
              "restore"
                ? "/restore"
                : ""
            }`,
            {
              method:
                action ===
                "restore"
                  ? "PATCH"
                  : "DELETE",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            data?.message ||
              "Unable to moderate post."
          );
        }

        await loadModerationData();
      } catch (err) {
        console.error(
          "POST MODERATION ERROR:",
          err
        );

        alert(
          err instanceof Error
            ? err.message
            : "Unable to moderate post."
        );
      } finally {
        setActionLoading(
          ""
        );
      }
    };

  // ======================================================
  // COMMUNITY COMMENT MODERATION
  // ======================================================

  const handleCommentModeration =
    async (
      comment: CommunityComment
    ) => {
      const action =
        comment.isRemoved
          ? "restore"
          : "remove";

      const confirmed =
        window.confirm(
          comment.isRemoved
            ? "Restore this comment?"
            : "Remove this comment?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `comment-${comment._id}`
        );

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/community/admin/comments/${comment._id}${
              action ===
              "restore"
                ? "/restore"
                : ""
            }`,
            {
              method:
                action ===
                "restore"
                  ? "PATCH"
                  : "DELETE",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            data?.message ||
              "Unable to moderate comment."
          );
        }

        await loadModerationData();
      } catch (err) {
        console.error(
          "COMMENT MODERATION ERROR:",
          err
        );

        alert(
          err instanceof Error
            ? err.message
            : "Unable to moderate comment."
        );
      } finally {
        setActionLoading(
          ""
        );
      }
    };

  // ======================================================
  // DELETE PRIVATE CHAT MESSAGE
  // ======================================================

  const handleDeleteChatMessage =
    async (
      messageId: string
    ) => {
      if (
        !selectedChat
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this private-chat message?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `chat-message-${messageId}`
        );

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/admin/chats/${selectedChat._id}/messages/${messageId}`,
            {
              method:
                "DELETE",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            data?.message ||
              "Unable to delete message."
          );
        }

        setChatMessages(
          (
            previous
          ) =>
            previous.map(
              (
                item
              ) =>
                item._id ===
                messageId
                  ? {
                      ...item,
                      isDeleted:
                        true,
                    }
                  : item
            )
        );
      } catch (err) {
        console.error(
          "ADMIN CHAT MESSAGE DELETE ERROR:",
          err
        );

        alert(
          err instanceof Error
            ? err.message
            : "Unable to delete message."
        );
      } finally {
        setActionLoading(
          ""
        );
      }
    };

  // ======================================================
  // CLOSE PRIVATE CHAT
  // ======================================================

  const handleCloseChat =
    async () => {
      if (
        !selectedChat
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Close this private chat?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `close-chat-${selectedChat._id}`
        );

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/admin/chats/${selectedChat._id}/close`,
            {
              method:
                "PATCH",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            data?.message ||
              "Unable to close chat."
          );
        }

        setSelectedChat(
          (
            previous
          ) =>
            previous
              ? {
                  ...previous,
                  status:
                    "closed",
                }
              : null
        );

        await loadAdminChats();

        await loadAdminData();
      } catch (err) {
        console.error(
          "CLOSE CHAT ERROR:",
          err
        );

        alert(
          err instanceof Error
            ? err.message
            : "Unable to close chat."
        );
      } finally {
        setActionLoading(
          ""
        );
      }
    };

  // ======================================================
  // DELETE COMMUNITY CHAT MESSAGE
  // ======================================================

  const handleDeleteCommunityMessage =
    async (
      messageId: string
    ) => {
      const confirmed =
        window.confirm(
          "Delete this Community Chat message?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `community-message-${messageId}`
        );

        const token =
          getToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_URL}/admin/community-chat/${messageId}`,
            {
              method:
                "DELETE",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            handleUnauthorized();

            return;
          }

          throw new Error(
            data?.message ||
              "Unable to delete community message."
          );
        }

        setCommunityMessages(
          (
            previous
          ) =>
            previous.map(
              (
                item
              ) =>
                item._id ===
                messageId
                  ? {
                      ...item,

                      isDeleted:
                        true,

                      deletedByAdmin:
                        true,
                    }
                  : item
            )
        );

        await loadAdminData();
      } catch (err) {
        console.error(
          "ADMIN COMMUNITY MESSAGE DELETE ERROR:",
          err
        );

        alert(
          err instanceof Error
            ? err.message
            : "Unable to delete community message."
        );
      } finally {
        setActionLoading(
          ""
        );
      }
    };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout =
    async () => {
      try {
        const token =
          getToken();

        await fetch(
          `${API_URL}/auth/logout`,
          {
            method:
              "POST",

            credentials:
              "include",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error(
          "ADMIN LOGOUT ERROR:",
          error
        );
      }

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      sessionStorage.removeItem(
        "communityAnonymousName"
      );

      window.location.href =
        "/";
    };

  // ======================================================
  // LOADING
  // ======================================================

  if (
    loading
  ) {
    return (
      <main className="min-h-screen bg-[#070712] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />

            <p className="text-lg text-gray-300">
              Loading Admin Dashboard...
            </p>

          </div>
        </div>
      </main>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (
    error
  ) {
    return (
      <main className="min-h-screen bg-[#070712] text-white">
        <div className="flex min-h-screen items-center justify-center px-6">

          <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-white/5 p-10 text-center backdrop-blur-xl">

            <div className="mb-5 text-5xl">
              ⚠️
            </div>

            <h1 className="mb-3 text-2xl font-bold">
              Admin Dashboard Error
            </h1>

            <p className="mb-7 text-gray-400">
              {error}
            </p>

            <button
              type="button"
              onClick={
                loadAdminData
              }
              className="rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
            >
              Try Again
            </button>

          </div>
        </div>
      </main>
    );
  }

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <main className="min-h-screen bg-[#070712] text-white">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="border-b border-white/10 bg-white/[0.03] backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 lg:px-10">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 text-xl font-black shadow-lg shadow-violet-500/20">
              68
            </div>

            <div>

              <h1 className="text-2xl font-black tracking-wide">
                PROJECT68
              </h1>

              <p className="text-sm text-violet-300">
                Admin Control Center
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
          >
            Logout
          </button>

        </div>

      </header>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-10">

        {/* ==================================================
            TITLE
        ================================================== */}

        <div className="mb-10">

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Restricted Area
          </p>

          <h2 className="text-4xl font-black">
            Admin Dashboard
          </h2>

          <p className="mt-3 max-w-3xl text-gray-400">
            Manage Project68 users, moderate community
            content, and monitor private and community
            conversations.
          </p>

        </div>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <section className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          {/* TOTAL USERS */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-xl backdrop-blur-xl">

            <div className="mb-5 flex items-center justify-between">
              <span className="text-3xl">
                👥
              </span>

              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                USERS
              </span>
            </div>

            <p className="text-sm text-gray-400">
              Total Users
            </p>

            <p className="mt-2 text-4xl font-black">
              {stats?.totalUsers ??
                0}
            </p>

          </div>

          {/* STUDENTS */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-xl backdrop-blur-xl">

            <div className="mb-5 flex items-center justify-between">
              <span className="text-3xl">
                🎓
              </span>

              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                STUDENTS
              </span>
            </div>

            <p className="text-sm text-gray-400">
              Total Students
            </p>

            <p className="mt-2 text-4xl font-black">
              {stats?.totalStudents ??
                0}
            </p>

          </div>

          {/* ADMINS */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-xl backdrop-blur-xl">

            <div className="mb-5 flex items-center justify-between">
              <span className="text-3xl">
                🛡️
              </span>

              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                ADMIN
              </span>
            </div>

            <p className="text-sm text-gray-400">
              Total Admins
            </p>

            <p className="mt-2 text-4xl font-black">
              {stats?.totalAdmins ??
                0}
            </p>

          </div>

          {/* ONLINE */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-xl backdrop-blur-xl">

            <div className="mb-5 flex items-center justify-between">
              <span className="text-3xl">
                🟢
              </span>

              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
                LIVE
              </span>
            </div>

            <p className="text-sm text-gray-400">
              Online Users
            </p>

            <p className="mt-2 text-4xl font-black">
              {stats?.onlineUsers ??
                0}
            </p>

          </div>

          {/* COMMUNITY MESSAGES */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-xl backdrop-blur-xl">

            <div className="mb-5 flex items-center justify-between">
              <span className="text-3xl">
                🌐
              </span>

              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                COMMUNITY
              </span>
            </div>

            <p className="text-sm text-gray-400">
              Community Messages
            </p>

            <p className="mt-2 text-4xl font-black">
              {stats?.communityMessages ??
                communityMessages.length}
            </p>

          </div>

        </section>

        {/* ==================================================
            USER MANAGEMENT
        ================================================== */}

        <section className="mb-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-xl">

          <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-6 md:flex-row md:items-center md:justify-between lg:px-8">

            <div>

              <h3 className="text-2xl font-bold">
                User Management
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                {users.length} registered account
                {users.length ===
                1
                  ? ""
                  : "s"}
              </p>

            </div>

            <button
              type="button"
              onClick={
                loadAdminData
              }
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
            >
              ↻ Refresh
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1250px] text-left">

              <thead>

                <tr className="border-b border-white/10 bg-white/[0.02]">

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Roll Number
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Department
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Year
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    XP
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Level
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Streak
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan={10}
                      className="px-6 py-16 text-center text-gray-500"
                    >
                      No users found.
                    </td>

                  </tr>

                ) : (

                  users.map(
                    (
                      user
                    ) => {

                      const isAdmin =
                        user.role ===
                        "admin";

                      const isSuspended =
                        user.accountStatus ===
                        "suspended";

                      const isProcessing =
                        actionLoading ===
                        user._id;

                      return (
                        <tr
                          key={
                            user._id
                          }
                          className="border-b border-white/5 transition hover:bg-white/[0.03]"
                        >

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-4">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 font-bold">

                                {user.avatar ? (

                                  <img
                                    src={
                                      user.avatar
                                    }
                                    alt={
                                      user.name
                                    }
                                    className="h-full w-full object-cover"
                                  />

                                ) : (

                                  user.name
                                    ?.charAt(
                                      0
                                    )
                                    .toUpperCase()

                                )}

                              </div>

                              <div>

                                <p className="font-semibold text-white">
                                  {user.name}
                                </p>

                                <p className="text-xs text-gray-500">
                                  {user._id}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-5">

                            <span className="font-mono text-sm text-violet-300">
                              {user.rollNumber}
                            </span>

                          </td>

                          <td className="px-6 py-5">

                            {isAdmin ? (

                              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                                ADMIN
                              </span>

                            ) : (

                              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                                STUDENT
                              </span>

                            )}

                          </td>

                          <td className="px-6 py-5 text-sm text-gray-300">
                            {user.department ||
                              "—"}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-300">
                            {user.year ||
                              "—"}
                          </td>

                          <td className="px-6 py-5">

                            {isSuspended ? (

                              <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                <span className="h-2 w-2 rounded-full bg-red-400" />
                                Suspended
                              </span>

                            ) : user.isOnline ? (

                              <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
                                <span className="h-2 w-2 rounded-full bg-green-400" />
                                Online
                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-gray-500">
                                <span className="h-2 w-2 rounded-full bg-gray-600" />
                                Offline
                              </span>

                            )}

                          </td>

                          <td className="px-6 py-5 text-sm text-gray-300">
                            {user.xp ??
                              0}
                          </td>

                          <td className="px-6 py-5">

                            <span className="font-semibold text-yellow-300">
                              {user.level ??
                                1}
                            </span>

                          </td>

                          <td className="px-6 py-5">

                            <span className="font-semibold text-orange-300">
                              🔥{" "}
                              {user.streak ??
                                0}
                            </span>

                          </td>

                          <td className="px-6 py-5">

                            {isAdmin ? (

                              <span className="text-xs text-gray-600">
                                Protected
                              </span>

                            ) : (

                              <button
                                type="button"
                                onClick={() =>
                                  handleAccountStatus(
                                    user
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                className={
                                  isSuspended
                                    ? "rounded-xl bg-green-600/15 px-4 py-2 text-xs font-semibold text-green-300 transition hover:bg-green-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                                    : "rounded-xl bg-red-600/15 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                                }
                              >
                                {isProcessing
                                  ? "Processing..."
                                  : isSuspended
                                  ? "Unsuspend"
                                  : "Suspend"}
                              </button>

                            )}

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* ==================================================
            PRIVATE CHAT MONITORING
        ================================================== */}

        <section className="mb-12 overflow-hidden rounded-3xl border border-blue-500/20 bg-blue-500/[0.03] shadow-xl">

          <div className="border-b border-white/10 px-6 py-6 lg:px-8">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                  Private Chat
                </p>

                <h3 className="text-3xl font-black">
                  Chat Monitoring
                </h3>

                <p className="mt-2 max-w-2xl text-sm text-gray-400">
                  Monitor active private conversations,
                  inspect participant identities, review
                  message history, moderate messages, and
                  close conversations when necessary.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  loadAdminChats
                }
                className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20"
              >
                ↻ Refresh Chats
              </button>

            </div>

          </div>

          {chatError && (

            <div className="mx-6 mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300 lg:mx-8">
              {chatError}
            </div>

          )}

          <div className="grid lg:grid-cols-[420px_1fr]">

            {/* CHAT LIST */}

            <div className="border-b border-white/10 lg:border-b-0 lg:border-r">

              <div className="px-6 py-5">

                <p className="text-sm font-semibold text-gray-400">
                  {chats.length} active private chat
                  {chats.length ===
                  1
                    ? ""
                    : "s"}
                </p>

              </div>

              <div className="max-h-[700px] overflow-y-auto">

                {chats.length ===
                0 ? (

                  <div className="px-6 py-12 text-center text-gray-500">
                    No active private chats.
                  </div>

                ) : (

                  chats.map(
                    (chat) => {

                      const first =
                        chat.participants?.[0];

                      const second =
                        chat.participants?.[1];

                      const selected =
                        selectedChat?._id ===
                        chat._id;

                      return (
                        <button
                          key={
                            chat._id
                          }
                          type="button"
                          onClick={() =>
                            loadAdminChat(
                              chat._id
                            )
                          }
                          className={`w-full border-t border-white/5 px-6 py-5 text-left transition ${
                            selected
                              ? "bg-blue-500/10"
                              : "hover:bg-white/[0.03]"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <p className="truncate font-semibold text-white">
                                {first?.name ||
                                  "Unknown"}
                                {" "}
                                ↔{" "}
                                {second?.name ||
                                  "Unknown"}
                              </p>

                              <p className="mt-1 truncate font-mono text-xs text-gray-500">
                                {first?.rollNumber ||
                                  "Unknown"}
                                {" "}
                                •{" "}
                                {second?.rollNumber ||
                                  "Unknown"}
                              </p>

                            </div>

                            <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-semibold text-green-300">
                              ACTIVE
                            </span>

                          </div>

                          <p className="mt-3 line-clamp-2 text-sm text-gray-400">
                            {chat.lastMessage ||
                              "No messages yet"}
                          </p>

                          <p className="mt-2 text-[11px] text-gray-600">
                            {chat.lastActivity
                              ? new Date(
                                  chat.lastActivity
                                ).toLocaleString()
                              : ""}
                          </p>

                        </button>
                      );
                    }
                  )

                )}

              </div>

            </div>

            {/* CHAT DETAIL */}

            <div className="min-h-[700px]">

              {!selectedChat ? (

                <div className="flex min-h-[700px] items-center justify-center px-6">

                  <div className="max-w-md text-center">

                    <div className="mb-5 text-6xl">
                      💬
                    </div>

                    <h4 className="text-2xl font-bold">
                      Select a private chat
                    </h4>

                    <p className="mt-2 text-gray-500">
                      Select a conversation to inspect
                      participants and message history.
                    </p>

                  </div>

                </div>

              ) : chatLoading ? (

                <div className="flex min-h-[700px] items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

                    <p className="text-gray-400">
                      Loading conversation...
                    </p>

                  </div>

                </div>

              ) : (

                <div className="flex min-h-[700px] flex-col">

                  <div className="border-b border-white/10 px-6 py-6 lg:px-8">

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h4 className="text-2xl font-bold">
                            Private Conversation
                          </h4>

                          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                            ADMIN MONITOR
                          </span>

                        </div>

                        <p className="mt-2 break-all text-xs text-gray-600">
                          Chat ID:{" "}
                          {selectedChat._id}
                        </p>

                      </div>

                      <div className="flex items-center gap-3">

                        <span
                          className={
                            selectedChat.status ===
                            "active"
                              ? "rounded-full bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-300"
                              : "rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-gray-500"
                          }
                        >
                          {selectedChat.status ===
                          "active"
                            ? "Active"
                            : "Closed"}
                        </span>

                        {selectedChat.status ===
                        "active" ? (

                          <button
                            type="button"
                            onClick={
                              handleCloseChat
                            }
                            disabled={
                              actionLoading ===
                              `close-chat-${selectedChat._id}`
                            }
                            className="rounded-xl bg-red-600/15 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoading ===
                            `close-chat-${selectedChat._id}`
                              ? "Closing..."
                              : "Close Chat"}
                          </button>

                        ) : null}

                      </div>

                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">

                      {selectedChat.participants.map(
                        (
                          participant
                        ) => {

                          const identity =
                            selectedChat.anonymousIdentities?.find(
                              (
                                item
                              ) =>
                                String(
                                  item.user
                                ) ===
                                String(
                                  participant._id
                                )
                            );

                          return (
                            <div
                              key={
                                participant._id
                              }
                              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                            >

                              <div className="flex items-start justify-between gap-4">

                                <div>

                                  <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                    Real Identity
                                  </p>

                                  <p className="mt-1 text-lg font-bold text-white">
                                    {participant.name}
                                  </p>

                                  <p className="font-mono text-sm text-violet-300">
                                    {participant.rollNumber}
                                  </p>

                                </div>

                                <span
                                  className={
                                    participant.isOnline
                                      ? "rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300"
                                      : "rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-gray-500"
                                  }
                                >
                                  {participant.isOnline
                                    ? "Online"
                                    : "Offline"}
                                </span>

                              </div>

                              <div className="mt-4 space-y-1 text-sm text-gray-400">

                                <p>
                                  {participant.department ||
                                    "Department not set"}
                                </p>

                                <p>
                                  Year{" "}
                                  {participant.year ||
                                    "—"}
                                </p>

                                <p>
                                  Account:{" "}
                                  {participant.accountStatus ||
                                    "unknown"}
                                </p>

                              </div>

                              <div className="mt-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-3">

                                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                  Anonymous identity shown
                                  to student
                                </p>

                                <p className="mt-1 font-semibold text-cyan-300">
                                  {identity?.anonymousName ||
                                    "Anonymous"}
                                </p>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">

                    {chatMessages.length ===
                    0 ? (

                      <div className="flex min-h-[300px] items-center justify-center">

                        <div className="text-center">

                          <div className="mb-4 text-5xl">
                            📭
                          </div>

                          <p className="text-gray-500">
                            No messages in this chat.
                          </p>

                        </div>

                      </div>

                    ) : (

                      <div className="space-y-4">

                        {chatMessages.map(
                          (
                            message
                          ) => {

                            const processing =
                              actionLoading ===
                              `chat-message-${message._id}`;

                            return (
                              <div
                                key={
                                  message._id
                                }
                                className={`rounded-2xl border p-5 ${
                                  message.isDeleted
                                    ? "border-red-500/10 bg-red-500/[0.03]"
                                    : "border-white/10 bg-white/[0.03]"
                                }`}
                              >

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                  <div>

                                    <p className="font-semibold text-white">
                                      {message.sender?.name ||
                                        "Unknown sender"}
                                    </p>

                                    <p className="font-mono text-xs text-violet-300">
                                      {message.sender?.rollNumber ||
                                        ""}
                                    </p>

                                    {message.receiver && (
                                      <p className="mt-1 text-[11px] text-gray-600">
                                        To:{" "}
                                        {message.receiver.name}
                                        {" "}
                                        (
                                        {message.receiver.rollNumber}
                                        )
                                      </p>
                                    )}

                                  </div>

                                  <div className="text-right">

                                    <p className="text-xs text-gray-500">
                                      {message.createdAt
                                        ? new Date(
                                            message.createdAt
                                          ).toLocaleString()
                                        : ""}
                                    </p>

                                    {!message.isDeleted && (

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteChatMessage(
                                            message._id
                                          )
                                        }
                                        disabled={
                                          processing
                                        }
                                        className="mt-2 rounded-lg bg-red-600/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {processing
                                          ? "Deleting..."
                                          : "Delete Message"}
                                      </button>

                                    )}

                                  </div>

                                </div>

                                {message.replyTo && (

                                  <div className="mt-4 rounded-xl border-l-4 border-cyan-500/50 bg-black/20 px-4 py-3">

                                    <p className="text-xs font-semibold text-cyan-300">
                                      Reply
                                    </p>

                                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-400">
                                      {message.replyTo.message}
                                    </p>

                                  </div>

                                )}

                                <p
                                  className={
                                    message.isDeleted
                                      ? "mt-4 text-sm italic text-red-400"
                                      : "mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-gray-200"
                                  }
                                >
                                  {message.isDeleted
                                    ? "Message removed by administrator."
                                    : message.message}
                                </p>

                                {message.attachment && (

                                  <div className="mt-4 rounded-xl bg-black/20 p-3">

                                    <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                      Attachment
                                    </p>

                                    <p className="mt-1 break-all text-xs text-gray-500">
                                      {message.attachment}
                                    </p>

                                  </div>

                                )}

                              </div>
                            );
                          }
                        )}

                      </div>

                    )}

                  </div>

                </div>

              )}

            </div>

          </div>

        </section>

        {/* ==================================================
            COMMUNITY CHAT MONITORING
        ================================================== */}

        <section className="mb-12 overflow-hidden rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.03] shadow-xl">

          <div className="border-b border-white/10 px-6 py-6 lg:px-8">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                  Community Lounge
                </p>

                <h3 className="text-3xl font-black">
                  Community Chat Monitoring
                </h3>

                <p className="mt-2 max-w-3xl text-sm text-gray-400">
                  Review community chat messages, see the
                  anonymous identity and the internally
                  verified real author, inspect replies,
                  retention, expiry, and moderate messages.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  loadAdminCommunityMessages
                }
                className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
              >
                ↻ Refresh Community
              </button>

            </div>

          </div>

          {communityChatError && (

            <div className="mx-6 mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300 lg:mx-8">
              {communityChatError}
            </div>

          )}

          {communityChatLoading ? (

            <div className="flex min-h-[350px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />

                <p className="text-gray-400">
                  Loading Community Chat...
                </p>

              </div>

            </div>

          ) : communityMessages.length ===
            0 ? (

            <div className="px-6 py-16 text-center">

              <div className="mb-4 text-6xl">
                🌐
              </div>

              <h4 className="text-2xl font-bold">
                No community messages
              </h4>

              <p className="mt-2 text-gray-500">
                Community Chat messages will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-white/5">

              {communityMessages.map(
                (
                  communityMessage
                ) => {

                  const processing =
                    actionLoading ===
                    `community-message-${communityMessage._id}`;

                  return (

                    <div
                      key={
                        communityMessage._id
                      }
                      className={`p-6 lg:p-8 ${
                        communityMessage.isDeleted
                          ? "bg-red-500/[0.02]"
                          : ""
                      }`}
                    >

                      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

                        {/* MESSAGE CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="mb-5 flex flex-wrap items-center gap-3">

                            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                              {communityMessage.anonymousName}
                            </span>

                            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                              {communityMessage.retention ===
                              "never"
                                ? "PERMANENT"
                                : "24 HOURS"}
                            </span>

                            {communityMessage.isExpired && (

                              <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                                EXPIRED
                              </span>

                            )}

                            {communityMessage.isDeleted && (

                              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                DELETED
                              </span>

                            )}

                          </div>

                          {/* REAL AUTHOR */}

                          <div className="mb-5 rounded-2xl border border-violet-500/10 bg-violet-500/5 p-5">

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                  Real Author
                                </p>

                                <p className="mt-1 font-semibold text-white">
                                  {communityMessage.author?.name ||
                                    "Unknown / legacy message"}
                                </p>

                              </div>

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                  Roll Number
                                </p>

                                <p className="mt-1 font-mono text-sm text-violet-300">
                                  {communityMessage.author?.rollNumber ||
                                    "Unavailable"}
                                </p>

                              </div>

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                  Department
                                </p>

                                <p className="mt-1 text-sm text-gray-300">
                                  {communityMessage.author?.department ||
                                    "—"}
                                </p>

                              </div>

                              <div>

                                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                  Account
                                </p>

                                <p className="mt-1 text-sm text-gray-300">
                                  {communityMessage.author?.accountStatus ||
                                    "Unknown"}
                                </p>

                              </div>

                            </div>

                          </div>

                          {/* REPLY */}

                          {communityMessage.replyTo && (

                            <div className="mb-5 rounded-xl border-l-4 border-cyan-500/50 bg-black/20 px-4 py-3">

                              <p className="text-xs font-semibold text-cyan-300">
                                Reply to{" "}
                                {communityMessage.replyTo.anonymousName ||
                                  "Anonymous"}
                              </p>

                              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-400">
                                {communityMessage.replyTo.message ||
                                  "(Image reply)"}
                              </p>

                            </div>

                          )}

                          {/* MESSAGE */}

                          <p
                            className={
                              communityMessage.isDeleted
                                ? "whitespace-pre-wrap break-words text-sm italic leading-7 text-red-400"
                                : "whitespace-pre-wrap break-words text-sm leading-7 text-gray-200"
                            }
                          >
                            {communityMessage.isDeleted
                              ? "This message was removed by an administrator."
                              : communityMessage.message ||
                                "(Image-only message)"}
                          </p>

                          {/* IMAGE */}

                          {communityMessage.imageUrl && (

                            <img
                              src={
                                communityMessage.imageUrl
                              }
                              alt="Community message attachment"
                              className="mt-5 max-h-80 rounded-2xl border border-white/10 object-cover"
                            />

                          )}

                          {/* METADATA */}

                          <div className="mt-5 grid gap-4 text-sm md:grid-cols-3">

                            <div>

                              <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                Created
                              </p>

                              <p className="mt-1 text-gray-300">
                                {communityMessage.createdAt
                                  ? new Date(
                                      communityMessage.createdAt
                                    ).toLocaleString()
                                  : "Unknown"}
                              </p>

                            </div>

                            <div>

                              <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                Expires
                              </p>

                              <p className="mt-1 text-gray-300">
                                {communityMessage.expiresAt
                                  ? new Date(
                                      communityMessage.expiresAt
                                    ).toLocaleString()
                                  : "Never"}
                              </p>

                            </div>

                            <div>

                              <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                Message ID
                              </p>

                              <p className="mt-1 break-all font-mono text-xs text-gray-500">
                                {communityMessage._id}
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* ACTION */}

                        <div className="shrink-0">

                          {!communityMessage.isDeleted ? (

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteCommunityMessage(
                                  communityMessage._id
                                )
                              }
                              disabled={
                                processing
                              }
                              className="rounded-xl bg-red-600/15 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processing
                                ? "Deleting..."
                                : "Delete Message"}
                            </button>

                          ) : (

                            <span className="rounded-xl bg-red-500/5 px-5 py-3 text-xs font-semibold text-red-400">
                              Moderated
                            </span>

                          )}

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

        {/* ==================================================
            COMMUNITY MODERATION
        ================================================== */}

        <section className="mb-12 space-y-8">

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Moderation
              </p>

              <h3 className="text-3xl font-black">
                Community Control
              </h3>

              <p className="mt-2 max-w-2xl text-gray-400">
                Review community posts and comments,
                see the real author identity, and remove
                or restore content when necessary.
              </p>

            </div>

            <button
              type="button"
              onClick={
                loadModerationData
              }
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
            >
              ↻ Refresh Moderation
            </button>

          </div>

          {moderationError && (

            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-300">
              {moderationError}
            </div>

          )}

          {/* POSTS */}

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-xl">

            <div className="border-b border-white/10 px-6 py-6 lg:px-8">

              <h4 className="text-2xl font-bold">
                Community Posts
              </h4>

              <p className="mt-1 text-sm text-gray-400">
                {posts.length} post
                {posts.length ===
                1
                  ? ""
                  : "s"}
              </p>

            </div>

            {moderationLoading ? (

              <div className="p-10 text-center text-cyan-400">
                Loading posts...
              </div>

            ) : posts.length ===
              0 ? (

              <div className="p-10 text-center text-gray-500">
                No community posts found.
              </div>

            ) : (

              <div className="divide-y divide-white/5">

                {posts.map(
                  (
                    post
                  ) => {

                    const processing =
                      actionLoading ===
                      `post-${post._id}`;

                    return (
                      <div
                        key={
                          post._id
                        }
                        className="p-6 lg:p-8"
                      >

                        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

                          <div className="min-w-0 flex-1">

                            <div className="mb-4 flex flex-wrap items-center gap-3">

                              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                                {post.anonymousName}
                              </span>

                              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                                {post.category ||
                                  "General"}
                              </span>

                              {post.isRemoved && (

                                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                  Removed
                                </span>

                              )}

                            </div>

                            <p className="whitespace-pre-wrap break-words text-gray-200">
                              {post.content ||
                                "(Image-only post)"}
                            </p>

                            {post.imageUrl && (

                              <img
                                src={
                                  post.imageUrl
                                }
                                alt="Community post"
                                className="mt-4 max-h-72 rounded-2xl border border-white/10 object-cover"
                              />

                            )}

                            <div className="mt-5 grid gap-3 text-sm text-gray-400 sm:grid-cols-2 lg:grid-cols-4">

                              <div>

                                <span className="text-gray-600">
                                  Real author
                                </span>

                                <p className="font-semibold text-white">
                                  {post.author
                                    ?.name ||
                                    "Unknown"}
                                </p>

                              </div>

                              <div>

                                <span className="text-gray-600">
                                  Roll number
                                </span>

                                <p className="font-mono text-violet-300">
                                  {post.author
                                    ?.rollNumber ||
                                    "Unknown"}
                                </p>

                              </div>

                              <div>

                                <span className="text-gray-600">
                                  Likes
                                </span>

                                <p className="font-semibold text-white">
                                  {post.likes ??
                                    0}
                                </p>

                              </div>

                              <div>

                                <span className="text-gray-600">
                                  Created
                                </span>

                                <p className="text-gray-300">
                                  {post.createdAt
                                    ? new Date(
                                        post.createdAt
                                      ).toLocaleString()
                                    : "Unknown"}
                                </p>

                              </div>

                            </div>

                          </div>

                          <div className="shrink-0">

                            <button
                              type="button"
                              onClick={() =>
                                handlePostModeration(
                                  post
                                )
                              }
                              disabled={
                                processing
                              }
                              className={
                                post.isRemoved
                                  ? "rounded-xl bg-green-600/15 px-5 py-3 text-sm font-semibold text-green-300 transition hover:bg-green-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                                  : "rounded-xl bg-red-600/15 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                              }
                            >
                              {processing
                                ? "Processing..."
                                : post.isRemoved
                                ? "Restore Post"
                                : "Remove Post"}
                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </section>

          {/* COMMENTS */}

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-xl">

            <div className="border-b border-white/10 px-6 py-6 lg:px-8">

              <h4 className="text-2xl font-bold">
                Community Comments
              </h4>

              <p className="mt-1 text-sm text-gray-400">
                {comments.length} comment
                {comments.length ===
                1
                  ? ""
                  : "s"}
              </p>

            </div>

            {moderationLoading ? (

              <div className="p-10 text-center text-cyan-400">
                Loading comments...
              </div>

            ) : comments.length ===
              0 ? (

              <div className="p-10 text-center text-gray-500">
                No community comments found.
              </div>

            ) : (

              <div className="divide-y divide-white/5">

                {comments.map(
                  (
                    comment
                  ) => {

                    const processing =
                      actionLoading ===
                      `comment-${comment._id}`;

                    return (
                      <div
                        key={
                          comment._id
                        }
                        className="p-6 lg:p-8"
                      >

                        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

                          <div className="min-w-0 flex-1">

                            <div className="mb-4 flex flex-wrap items-center gap-3">

                              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                                {comment.anonymousName}
                              </span>

                              {comment.isRemoved && (

                                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                  Removed
                                </span>

                              )}

                            </div>

                            <p className="whitespace-pre-wrap break-words text-gray-200">
                              {comment.content ||
                                "(Image-only comment)"}
                            </p>

                            {comment.imageUrl && (

                              <img
                                src={
                                  comment.imageUrl
                                }
                                alt="Community comment"
                                className="mt-4 max-h-64 rounded-2xl border border-white/10 object-cover"
                              />

                            )}

                            <div className="mt-5 grid gap-3 text-sm text-gray-400 sm:grid-cols-2 lg:grid-cols-4">

                              <div>

                                <span className="text-gray-600">
                                  Real author
                                </span>

                                <p className="font-semibold text-white">
                                  {comment.author
                                    ?.name ||
                                    "Unknown"}
                                </p>

                              </div>

                              <div>

                                <span className="text-gray-600">
                                  Roll number
                                </span>

                                <p className="font-mono text-violet-300">
                                  {comment.author
                                    ?.rollNumber ||
                                    "Unknown"}
                                </p>

                              </div>

                              <div>

                                <span className="text-gray-600">
                                  Likes
                                </span>

                                <p className="font-semibold text-white">
                                  {comment.likes ??
                                    0}
                                </p>

                              </div>

                              <div>

                                <span className="text-gray-600">
                                  Created
                                </span>

                                <p className="text-gray-300">
                                  {comment.createdAt
                                    ? new Date(
                                        comment.createdAt
                                      ).toLocaleString()
                                    : "Unknown"}
                                </p>

                              </div>

                            </div>

                            {comment.post && (

                              <div className="mt-5 rounded-xl border border-white/5 bg-black/10 p-4">

                                <p className="text-xs uppercase tracking-wider text-gray-600">
                                  Parent Post
                                </p>

                                <p className="mt-1 text-sm text-gray-400">
                                  {comment.post
                                    .anonymousName ||
                                    "Anonymous"}
                                </p>

                                {comment.post.content && (

                                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                                    {comment.post.content}
                                  </p>

                                )}

                              </div>

                            )}

                          </div>

                          <div className="shrink-0">

                            <button
                              type="button"
                              onClick={() =>
                                handleCommentModeration(
                                  comment
                                )
                              }
                              disabled={
                                processing
                              }
                              className={
                                comment.isRemoved
                                  ? "rounded-xl bg-green-600/15 px-5 py-3 text-sm font-semibold text-green-300 transition hover:bg-green-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                                  : "rounded-xl bg-red-600/15 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                              }
                            >
                              {processing
                                ? "Processing..."
                                : comment.isRemoved
                                ? "Restore Comment"
                                : "Remove Comment"}
                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </section>

        </section>

        {/* ==================================================
            PRIVACY NOTICE
        ================================================== */}

        <div className="rounded-2xl border border-violet-500/10 bg-violet-500/5 p-5">

          <div className="flex gap-4">

            <span className="text-2xl">
              🔐
            </span>

            <div>

              <h4 className="font-semibold text-violet-200">
                Administrator Privacy Access
              </h4>

              <p className="mt-1 text-sm leading-6 text-gray-400">
                Real student identity and private/community
                moderation information are available only
                through protected administrator controls.
                Student-facing APIs continue to expose
                anonymous identities only.
              </p>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}