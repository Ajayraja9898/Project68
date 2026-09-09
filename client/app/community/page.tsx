"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import EmojiPicker, {
  EmojiClickData,
  Theme,
} from "emoji-picker-react";

import {
  Clock3,
  Image as ImageIcon,
  Infinity,
  Reply,
  Send,
  Smile,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

import {
  connectSocket,
  disconnectSocket,
  joinCommunity,
  leaveCommunity,
  onCommunityMessage,
  sendCommunityMessage,
} from "@/services/socketService";

import { getCommunityMessages } from "@/services/communityService";

// ======================================================
// TYPES
// ======================================================

type RetentionType = "24h" | "never";

interface CommunityReply {
  _id?: string;
  anonymousName?: string;
  isMine?: boolean;
  message?: string;
  imageUrl?: string;
  createdAt?: string;
  retention?: RetentionType;
  expiresAt?: string | null;
}

interface CommunityMessage {
  _id?: string;
  anonymousName: string;
  isMine?: boolean;
  message: string;
  imageUrl?: string;
  replyTo?: CommunityReply | null;
  retention?: RetentionType;
  expiresAt?: string | null;
  isDeleted?: boolean;
  deletedByAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ======================================================
// CONSTANTS
// ======================================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// ======================================================
// COMMUNITY PAGE
// ======================================================

export default function CommunityPage() {
  // ====================================================
  // STATE
  // ====================================================

  const [anonymousName, setAnonymousName] = useState("");
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<CommunityMessage[]>([]);

  const [connected, setConnected] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ====================================================
  // IMAGE STATE
  // ====================================================

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");

  // ====================================================
  // RETENTION
  // ====================================================

  const [retention, setRetention] =
    useState<RetentionType>("24h");

  // ====================================================
  // REPLY
  // ====================================================

  const [replyingTo, setReplyingTo] =
    useState<CommunityMessage | null>(null);

  // ====================================================
  // REFS
  // ====================================================

  const messagesContainerRef =
    useRef<HTMLDivElement | null>(null);

  const imageInputRef =
    useRef<HTMLInputElement | null>(null);

  // ====================================================
  // ANONYMOUS IDENTITY
  // ====================================================
  //
  // Each logged-in user gets one stable anonymous name.
  //
  // Example:
  //
  // User A -> Anonymous 4821
  // User B -> Anonymous 7356
  //
  // Real name/email/roll number are NOT displayed.
  // ====================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        setAnonymousName("Anonymous");
        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      const userId =
        parsedUser?._id ||
        parsedUser?.id ||
        parsedUser?.user?._id ||
        parsedUser?.user?.id;

      if (!userId) {
        setAnonymousName("Anonymous");
        return;
      }

      const storageKey =
        `communityAnonymousName_${userId}`;

      let name =
        localStorage.getItem(storageKey);

      if (!name) {
        const number =
          Math.floor(
            1000 +
              Math.random() *
                9000
          );

        name =
          `Anonymous ${number}`;

        localStorage.setItem(
          storageKey,
          name
        );
      }

      setAnonymousName(name);
    } catch (error) {
      console.error(
        "COMMUNITY ANONYMOUS NAME ERROR:",
        error
      );

      setAnonymousName("Anonymous");
    }
  }, []);

  // ====================================================
  // LOAD COMMUNITY MESSAGES
  // ====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadCommunityMessages() {
      try {
        setLoadingMessages(true);

        console.log(
          "📥 LOADING SAVED COMMUNITY MESSAGES..."
        );

        const data =
          await getCommunityMessages();

        console.log(
          "📥 COMMUNITY MESSAGES RESPONSE:",
          data
        );

        if (cancelled) {
          return;
        }

        if (
          data?.success &&
          Array.isArray(data.messages)
        ) {
          setMessages((previous) => {
            const combined = [
              ...data.messages,
              ...previous,
            ];

            const uniqueMessages =
              combined.filter(
                (item, index, array) => {
                  if (item._id) {
                    return (
                      array.findIndex(
                        (existing) =>
                          existing._id ===
                          item._id
                      ) === index
                    );
                  }

                  return (
                    array.findIndex(
                      (existing) =>
                        existing.anonymousName ===
                          item.anonymousName &&
                        existing.message ===
                          item.message &&
                        existing.createdAt ===
                          item.createdAt
                    ) === index
                  );
                }
              );

            uniqueMessages.sort((a, b) => {
              const timeA =
                a.createdAt
                  ? new Date(
                      a.createdAt
                    ).getTime()
                  : 0;

              const timeB =
                b.createdAt
                  ? new Date(
                      b.createdAt
                    ).getTime()
                  : 0;

              return timeA - timeB;
            });

            return uniqueMessages;
          });
        }
      } catch (error) {
        console.error(
          "🔥 COMMUNITY LOAD ERROR:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    }

    loadCommunityMessages();

    return () => {
      cancelled = true;
    };
  }, []);

  // ====================================================
  // SOCKET CONNECTION
  // ====================================================

  useEffect(() => {
    if (!anonymousName) {
      return;
    }

    const socket =
      connectSocket();

    // --------------------------------------------------
    // CONNECT
    // --------------------------------------------------

    const handleConnect = () => {
      console.log(
        "🟢 COMMUNITY SOCKET CONNECTED:",
        socket.id
      );

      setConnected(true);

      joinCommunity(
        anonymousName
      );
    };

    // --------------------------------------------------
    // DISCONNECT
    // --------------------------------------------------

    const handleDisconnect = () => {
      console.log(
        "🔴 COMMUNITY SOCKET DISCONNECTED"
      );

      setConnected(false);
    };

    // --------------------------------------------------
    // RECEIVE MESSAGE
    // --------------------------------------------------

    const removeMessageListener =
      onCommunityMessage(
        (
          newMessage: CommunityMessage
        ) => {
          console.log(
            "💬 COMMUNITY MESSAGE RECEIVED:",
            newMessage
          );

          setMessages((previous) => {
            if (newMessage._id) {
              const exists =
                previous.some(
                  (item) =>
                    item._id ===
                    newMessage._id
                );

              if (exists) {
                return previous;
              }
            }

            const existsWithoutId =
              previous.some(
                (item) =>
                  !item._id &&
                  item.anonymousName ===
                    newMessage.anonymousName &&
                  item.message ===
                    newMessage.message &&
                  item.createdAt ===
                    newMessage.createdAt
              );

            if (existsWithoutId) {
              return previous;
            }

            return [
              ...previous,
              newMessage,
            ];
          });
        }
      );

    // --------------------------------------------------
    // SOCKET EVENTS
    // --------------------------------------------------

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    // --------------------------------------------------
    // ALREADY CONNECTED
    // --------------------------------------------------

    if (socket.connected) {
      handleConnect();
    }

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    return () => {
      console.log(
        "🧹 CLEANING COMMUNITY SOCKET"
      );

      leaveCommunity();

      removeMessageListener();

      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      disconnectSocket();
    };
  }, [anonymousName]);

  // ====================================================
  // AUTO SCROLL
  // ====================================================

  useEffect(() => {
    const container =
      messagesContainerRef.current;

    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollTop =
        container.scrollHeight;
    });
  }, [messages]);

  // ====================================================
  // REPLY
  // ====================================================

  function handleReply(
    selectedMessage: CommunityMessage
  ) {
    if (!selectedMessage._id) {
      console.log(
        "⚠️ Cannot reply: message has no ID"
      );

      return;
    }

    setReplyingTo(
      selectedMessage
    );

    setShowEmojiPicker(false);
  }

  // ====================================================
  // CANCEL REPLY
  // ====================================================

  function cancelReply() {
    setReplyingTo(null);
  }

  // ====================================================
  // EMOJI
  // ====================================================

  function handleEmojiClick(
    emojiData: EmojiClickData
  ) {
    setMessage(
      (previous) =>
        previous +
        emojiData.emoji
    );

    setShowEmojiPicker(false);
  }

  // ====================================================
  // IMAGE SELECT
  // ====================================================

  function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select an image file."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      alert(
        "Image must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result !==
        "string"
      ) {
        return;
      }

      setSelectedImage(
        result
      );

      setImageName(
        file.name
      );

      setShowEmojiPicker(
        false
      );
    };

    reader.onerror = () => {
      alert(
        "Unable to read the image."
      );
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  }

  // ====================================================
  // REMOVE IMAGE
  // ====================================================

  function removeSelectedImage() {
    setSelectedImage(null);
    setImageName("");
  }

  // ====================================================
  // SEND MESSAGE
  // ====================================================

  function handleSend() {
    const text =
      message.trim();

    if (!connected) {
      return;
    }

    if (
      !text &&
      !selectedImage
    ) {
      return;
    }

    const replyToId =
      replyingTo?._id ||
      null;

    const payload = {
      anonymousName,
      message: text,
      imageUrl:
        selectedImage || "",
      replyTo: replyToId,
      retention,
    };

    console.log(
      "📤 SENDING COMMUNITY MESSAGE:",
      payload
    );

    sendCommunityMessage(
      payload
    );

    setMessage("");

    setSelectedImage(null);

    setImageName("");

    setReplyingTo(null);

    setShowEmojiPicker(false);
  }

  // ====================================================
  // ENTER KEY
  // ====================================================

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  }

  // ====================================================
  // FORMAT EXPIRATION
  // ====================================================

  function formatExpiration(
    expiresAt?: string | null
  ) {
    if (!expiresAt) {
      return "";
    }

    const date =
      new Date(expiresAt);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleString(
      [],
      {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-950 text-white">

      {/* SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-[60] w-[280px] overflow-hidden">
        <Sidebar />
      </aside>

      {/* NAVBAR */}

      <header className="fixed left-[280px] right-0 top-0 z-[50] h-[68px]">
        <Navbar />
      </header>

      {/* MAIN */}

      <main className="ml-[280px] h-screen min-w-0 overflow-hidden pt-[68px]">

        <div className="flex h-[calc(100vh-68px)] min-h-0 flex-col gap-3 p-4">

          {/* COMMUNITY HEADER */}

          <div className="flex shrink-0 items-center justify-between rounded-2xl border border-white/10 bg-slate-900 px-5 py-4">

            <div className="min-w-0">

              <h1 className="truncate text-2xl font-black text-white">
                Community Lounge
              </h1>

              <p className="mt-1 text-sm text-gray-400">
                Chat anonymously with everyone
              </p>

            </div>

            {connected ? (
              <div className="ml-4 flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-400">

                <Wifi size={16} />

                Live

              </div>
            ) : (
              <div className="ml-4 flex shrink-0 items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400">

                <WifiOff size={16} />

                Offline

              </div>
            )}

          </div>

          {/* IDENTITY */}

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white">
              ?
            </div>

            <div className="min-w-0">

              <p className="text-xs text-gray-500">
                You are anonymous as
              </p>

              <p className="truncate font-bold text-cyan-400">
                {anonymousName ||
                  "Connecting..."}
              </p>

            </div>

          </div>

          {/* CHAT CONTAINER */}

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900">

            {/* CHAT HEADER */}

            <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">

                <Users
                  size={19}
                  className="text-cyan-400"
                />

              </div>

              <div className="min-w-0">

                <p className="font-bold text-white">
                  Live Community Chat
                </p>

                <p className="text-xs text-gray-500">
                  Everyone can participate
                </p>

              </div>

            </div>

            {/* MESSAGE AREA */}

            <div
              ref={
                messagesContainerRef
              }
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5"
            >

              {loadingMessages ? (

                <div className="flex min-h-full items-center justify-center">

                  <div className="text-center">

                    <div className="mb-3 text-3xl">
                      💬
                    </div>

                    <p className="font-bold text-gray-300">
                      Loading messages...
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Restoring community chat
                    </p>

                  </div>

                </div>

              ) : messages.length === 0 ? (

                <div className="flex min-h-full items-center justify-center">

                  <div className="text-center">

                    <div className="mb-3 text-4xl">
                      💬
                    </div>

                    <p className="font-bold text-gray-300">
                      No messages yet
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Send the first message.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="space-y-4 pb-6">

                  {messages.map(
                    (
                      item,
                      index
                    ) => {

                      const mine =
                        item.isMine === true;

                      const canReply =
                        Boolean(
                          item._id
                        );

                      const messageRetention =
                        item.retention ===
                        "never"
                          ? "never"
                          : "24h";

                      return (
                        <div
                          key={
                            item._id ||
                            `${
                              item.createdAt ||
                              "message"
                            }-${index}`
                          }
                          className={`flex w-full min-w-0 ${
                            mine
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >

                          <div
                            className={`min-w-0 max-w-[min(75%,700px)] overflow-hidden rounded-2xl px-4 py-3 shadow-lg ${
                              mine
                                ? "bg-cyan-600 text-white"
                                : "bg-slate-800 text-gray-100"
                            }`}
                          >

                            {/* NAME */}

                            <p
                              className={`mb-1 break-words text-xs font-bold ${
                                mine
                                  ? "text-cyan-100"
                                  : "text-cyan-400"
                              }`}
                            >
                              {mine
                                ? "You"
                                : item.anonymousName}
                            </p>

                            {/* REPLY */}

                            {item.replyTo && (
                              <div
                                className={`mb-2 overflow-hidden rounded-lg border-l-2 px-3 py-2 text-xs ${
                                  mine
                                    ? "border-cyan-200 bg-cyan-700/50"
                                    : "border-cyan-400 bg-slate-700"
                                }`}
                              >

                                <p className="break-words font-semibold opacity-80">

                                  Replying to{" "}

                                  {item.replyTo
                                    .anonymousName ||
                                    "Anonymous"}

                                </p>

                                {item.replyTo
                                  .message && (
                                  <p className="mt-1 break-words opacity-70">
                                    {
                                      item
                                        .replyTo
                                        .message
                                    }
                                  </p>
                                )}

                                {item.replyTo
                                  .imageUrl && (
                                  <img
                                    src={
                                      item
                                        .replyTo
                                        .imageUrl
                                    }
                                    alt="Replied image"
                                    className="mt-2 max-h-24 rounded-lg object-contain"
                                  />
                                )}

                              </div>
                            )}

                            {/* MESSAGE */}

                            {item.message && (
                              <p className="break-words whitespace-pre-wrap text-sm leading-6">
                                {
                                  item.message
                                }
                              </p>
                            )}

                            {/* IMAGE */}

                            {item.imageUrl && (
                              <img
                                src={
                                  item.imageUrl
                                }
                                alt="Shared image"
                                className="mt-3 max-h-[400px] max-w-full rounded-xl object-contain"
                              />
                            )}

                            {/* FOOTER */}

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">

                              <div className="flex flex-wrap items-center gap-2">

                                {item.createdAt && (
                                  <p className="text-[10px] opacity-60">

                                    {new Date(
                                      item.createdAt
                                    ).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute:
                                          "2-digit",
                                      }
                                    )}

                                  </p>
                                )}

                                {/* RETENTION */}

                                <span
                                  className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                    messageRetention ===
                                    "24h"
                                      ? mine
                                        ? "bg-cyan-500/40 text-cyan-100"
                                        : "bg-amber-500/10 text-amber-300"
                                      : mine
                                        ? "bg-cyan-500/40 text-cyan-100"
                                        : "bg-emerald-500/10 text-emerald-300"
                                  }`}
                                >

                                  {messageRetention ===
                                  "24h" ? (
                                    <>
                                      <Clock3
                                        size={10}
                                      />

                                      24h
                                    </>
                                  ) : (
                                    <>
                                      <Infinity
                                        size={11}
                                      />

                                      Never
                                    </>
                                  )}

                                </span>

                                {/* EXPIRATION */}

                                {messageRetention ===
                                  "24h" &&
                                  item.expiresAt && (
                                    <span
                                      className="text-[9px] opacity-60"
                                      title="Message expiration time"
                                    >
                                      Expires{" "}
                                      {formatExpiration(
                                        item.expiresAt
                                      )}
                                    </span>
                                  )}

                              </div>

                              {/* REPLY */}

                              {canReply && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReply(
                                      item
                                    )
                                  }
                                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                                    mine
                                      ? "text-cyan-100 hover:bg-cyan-500"
                                      : "text-cyan-400 hover:bg-slate-700"
                                  }`}
                                >

                                  <Reply
                                    size={13}
                                  />

                                  Reply

                                </button>
                              )}

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* COMPOSER */}

            <div className="relative z-30 shrink-0 border-t border-white/10 bg-slate-950 p-3">

              {/* REPLY PREVIEW */}

              {replyingTo && (
                <div className="mb-2 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2">

                  <div className="min-w-0">

                    <p className="text-xs font-bold text-cyan-400">

                      Replying to{" "}

                      {
                        replyingTo.anonymousName
                      }

                    </p>

                    <p className="mt-1 truncate text-xs text-gray-400">

                      {replyingTo.message ||
                        "Image message"}

                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      cancelReply
                    }
                    className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-slate-700 hover:text-white"
                    aria-label="Cancel reply"
                  >
                    <X size={16} />
                  </button>

                </div>
              )}

              {/* IMAGE PREVIEW */}

              {selectedImage && (
                <div className="mb-2 flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2">

                  <img
                    src={
                      selectedImage
                    }
                    alt="Selected image"
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-bold text-cyan-400">
                      Image attached
                    </p>

                    <p className="truncate text-xs text-gray-400">
                      {imageName}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      removeSelectedImage
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-slate-700 hover:text-white"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>

                </div>
              )}

              {/* RETENTION */}

              <div className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900 px-3 py-2">

                <div className="flex min-w-0 items-center gap-2">

                  <Clock3
                    size={15}
                    className="shrink-0 text-cyan-400"
                  />

                  <div className="min-w-0">

                    <p className="text-[11px] font-bold text-gray-300">
                      Message retention
                    </p>

                    <p className="truncate text-[9px] text-gray-500">
                      Choose how long your message stays
                    </p>

                  </div>

                </div>

                <div className="flex shrink-0 rounded-lg border border-white/10 bg-slate-800 p-1">

                  <button
                    type="button"
                    onClick={() =>
                      setRetention(
                        "24h"
                      )
                    }
                    disabled={!connected}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-bold transition ${
                      retention ===
                      "24h"
                        ? "bg-amber-500 text-slate-950"
                        : "text-gray-400 hover:bg-slate-700 hover:text-white"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >

                    <Clock3
                      size={12}
                    />

                    24 hours

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRetention(
                        "never"
                      )
                    }
                    disabled={!connected}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-bold transition ${
                      retention ===
                      "never"
                        ? "bg-emerald-500 text-slate-950"
                        : "text-gray-400 hover:bg-slate-700 hover:text-white"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >

                    <Infinity
                      size={13}
                    />

                    Never

                  </button>

                </div>

              </div>

              {/* EMOJI PICKER */}

              {showEmojiPicker && (
                <div className="absolute bottom-[125px] left-3 z-[100]">

                  <EmojiPicker
                    onEmojiClick={
                      handleEmojiClick
                    }
                    theme={
                      Theme.DARK
                    }
                    lazyLoadEmojis
                    width={350}
                    height={450}
                  />

                </div>
              )}

              {/* IMAGE INPUT */}

              <input
                ref={
                  imageInputRef
                }
                type="file"
                accept="image/*"
                onChange={
                  handleImageSelect
                }
                className="hidden"
              />

              {/* INPUT BAR */}

              <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 p-2">

                {/* IMAGE */}

                <button
                  type="button"
                  onClick={() =>
                    imageInputRef.current?.click()
                  }
                  disabled={!connected}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-slate-700 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Send image"
                  aria-label="Send image"
                >

                  <ImageIcon
                    size={20}
                  />

                </button>

                {/* EMOJI */}

                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={!connected}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-slate-700 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Emoji"
                  aria-label="Open emoji picker"
                >

                  <Smile
                    size={20}
                  />

                </button>

                {/* TEXT */}

                <input
                  type="text"
                  value={message}
                  onChange={(event) => {
                    setMessage(
                      event.target.value
                    );

                    if (
                      showEmojiPicker
                    ) {
                      setShowEmojiPicker(
                        false
                      );
                    }
                  }}
                  onKeyDown={
                    handleKeyDown
                  }
                  disabled={!connected}
                  placeholder={
                    connected
                      ? replyingTo
                        ? "Write a reply..."
                        : "Type your message..."
                      : "Connecting to community..."
                  }
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-gray-500 disabled:opacity-50"
                />

                {/* SEND */}

                <button
                  type="button"
                  onClick={
                    handleSend
                  }
                  disabled={
                    !connected ||
                    (!message.trim() &&
                      !selectedImage)
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >

                  <Send
                    size={18}
                  />

                </button>

              </div>

              {/* IMAGE INFO */}

              <p className="mt-2 px-1 text-[9px] text-gray-600">
                Images up to 5 MB
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}