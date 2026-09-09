import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/api";

// ==========================================
// Socket.IO Server
// ==========================================

// ==========================================
// Types
// ==========================================

export type CommunityRetention = "24h" | "never";

export interface CommunityReplyData {
  _id?: string;
  anonymousName?: string;
  message?: string;
  imageUrl?: string;
  createdAt?: string;
  retention?: CommunityRetention;
}

export interface CommunityMessageData {
  _id?: string;
  anonymousName: string;
  message: string;
  imageUrl?: string;
  replyTo?: string | null;
  retention?: CommunityRetention;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityReceivedMessageData {
  _id?: string;
  anonymousName: string;
  message: string;
  imageUrl?: string;
  replyTo?: CommunityReplyData | null;
  retention?: CommunityRetention;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityUserJoinedData {
  anonymousName: string;
}

// ==========================================
// Socket Instance
// ==========================================

let socket: Socket | null = null;

// ==========================================
// Get Socket
// ==========================================

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🟢 SOCKET CONNECTED:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 SOCKET DISCONNECTED:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("🔥 SOCKET CONNECTION ERROR:", error);
    });
  }

  return socket;
}

// ==========================================
// Connect
// ==========================================

export function connectSocket(): Socket {
  const currentSocket = getSocket();

  if (!currentSocket.connected) {
    console.log("🔌 Connecting Socket.IO with authentication cookie...");
    currentSocket.connect();
  }

  return currentSocket;
}

// ==========================================
// Disconnect
// ==========================================

export function disconnectSocket(): void {
  if (!socket) {
    return;
  }

  if (socket.connected) {
    console.log("🔌 Disconnecting Socket.IO...");
    socket.disconnect();
  }
}

// ==========================================
// Join Community
// ==========================================

export function joinCommunity(
  anonymousName: string
): void {
  const name = anonymousName.trim();

  if (!name) {
    console.warn(
      "⚠️ Cannot join community without anonymous name"
    );
    return;
  }

  const currentSocket = connectSocket();

  const emitJoin = () => {
    console.log(
      "👤 Joining Community:",
      name
    );

    currentSocket.emit(
      "community:join",
      name
    );
  };

  if (currentSocket.connected) {
    emitJoin();
  } else {
    currentSocket.once("connect", emitJoin);
  }
}

// ==========================================
// Leave Community
// ==========================================

export function leaveCommunity(): void {
  if (!socket || !socket.connected) {
    return;
  }

  console.log("👋 Leaving Community");

  socket.emit("community:leave");
}

// ==========================================
// Send Community Message
// ==========================================

export function sendCommunityMessage(
  messageData: CommunityMessageData
): void {
  const currentSocket = connectSocket();

  const anonymousName =
    messageData.anonymousName?.trim() || "";

  const text =
    messageData.message?.trim() || "";

  const imageUrl =
    messageData.imageUrl?.trim() || "";

  const retention: CommunityRetention =
    messageData.retention === "never"
      ? "never"
      : "24h";

  // Do not send an empty message
  if (!text && !imageUrl) {
    console.warn(
      "⚠️ Empty community message ignored"
    );

    return;
  }

  const payload: CommunityMessageData = {
    anonymousName,

    message: text,

    imageUrl,

    replyTo:
      messageData.replyTo || null,

    retention,
  };

  console.log(
    "📤 COMMUNITY MESSAGE:",
    payload
  );

  const emitMessage = () => {
    currentSocket.emit(
      "community:message",
      payload
    );
  };

  if (currentSocket.connected) {
    emitMessage();
  } else {
    currentSocket.once(
      "connect",
      emitMessage
    );
  }
}

// ==========================================
// Receive Community Messages
// ==========================================

export function onCommunityMessage(
  callback: (
    messageData: CommunityReceivedMessageData
  ) => void
): () => void {
  const currentSocket = getSocket();

  currentSocket.on(
    "community:message",
    callback
  );

  return () => {
    currentSocket.off(
      "community:message",
      callback
    );
  };
}

// ==========================================
// User Joined
// ==========================================

export function onCommunityUserJoined(
  callback: (
    data: CommunityUserJoinedData
  ) => void
): () => void {
  const currentSocket = getSocket();

  currentSocket.on(
    "community:user-joined",
    callback
  );

  return () => {
    currentSocket.off(
      "community:user-joined",
      callback
    );
  };
}

// ==========================================
// User Left
// ==========================================

export function onCommunityUserLeft(
  callback: (
    data: CommunityUserJoinedData
  ) => void
): () => void {
  const currentSocket = getSocket();

  currentSocket.on(
    "community:user-left",
    callback
  );

  return () => {
    currentSocket.off(
      "community:user-left",
      callback
    );
  };
}

// ==========================================
// Message Deleted
// ==========================================

export function onCommunityMessageDeleted(
  callback: (
    messageId: string
  ) => void
): () => void {
  const currentSocket = getSocket();

  currentSocket.on(
    "community:message-deleted",
    callback
  );

  return () => {
    currentSocket.off(
      "community:message-deleted",
      callback
    );
  };
}

// ==========================================
// Socket Connected
// ==========================================

export function onSocketConnect(
  callback: () => void
): () => void {
  const currentSocket = getSocket();

  currentSocket.on(
    "connect",
    callback
  );

  return () => {
    currentSocket.off(
      "connect",
      callback
    );
  };
}

// ==========================================
// Socket Disconnected
// ==========================================

export function onSocketDisconnect(
  callback: () => void
): () => void {
  const currentSocket = getSocket();

  currentSocket.on(
    "disconnect",
    callback
  );

  return () => {
    currentSocket.off(
      "disconnect",
      callback
    );
  };
}

// ==========================================
// Socket Error
// ==========================================

export function onSocketError(
  callback: (error: Error) => void
): () => void {
  const currentSocket = getSocket();

  currentSocket.on(
    "connect_error",
    callback
  );

  return () => {
    currentSocket.off(
      "connect_error",
      callback
    );
  };
}

// ==========================================
// Connection Status
// ==========================================

export function isSocketConnected(): boolean {
  return Boolean(
    socket?.connected
  );
}