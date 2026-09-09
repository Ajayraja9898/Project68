"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EmojiPicker, {
  EmojiClickData,
  Theme,
} from "emoji-picker-react";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

import {
  ArrowLeft,
  CornerUpLeft,
  Send,
  Smile,
  X,
} from "lucide-react";

import MessageBubble from "@/components/chat/MessageBubble";

import {
  getMessages,
  sendMessage,
} from "@/services/messageService";

import { getChatById } from "@/services/chatService";

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();

  const chatId = String(params?.chatId || "");

  const [messages, setMessages] = useState<any[]>([]);
  const [receiver, setReceiver] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // =========================================================
  // REPLY STATE
  // =========================================================

  const [replyingTo, setReplyingTo] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  // =========================================================
  // LOAD LOGGED-IN USER
  // =========================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        console.log("LOGGED IN USER:", parsedUser);

        setUser(parsedUser);
      }
    } catch (error) {
      console.error("USER LOAD ERROR:", error);
    } finally {
      setUserLoaded(true);
    }
  }, []);

  // =========================================================
  // CURRENT USER ID
  // =========================================================

  const currentUserId = String(
    user?._id ||
      user?.id ||
      user?.user?._id ||
      user?.user?.id ||
      ""
  );

  // =========================================================
  // SCROLL TO BOTTOM
  // =========================================================

  const scrollToBottom = useCallback(
    (smooth = true) => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "end",
        });
      }, 50);
    },
    []
  );

  // =========================================================
  // LOAD MESSAGES
  // =========================================================

  const loadMessages = useCallback(async () => {
    if (!chatId) {
      console.error("LOAD MESSAGES: CHAT ID MISSING");
      return;
    }

    try {
      const data = await getMessages(chatId);

      console.log("MESSAGES RESPONSE:", data);

      if (!data?.success) {
        console.error("GET MESSAGES FAILED:", data);
        return;
      }

      const serverMessages = Array.isArray(data.messages)
        ? data.messages
        : [];

      setMessages(serverMessages);

      scrollToBottom(false);
    } catch (error) {
      console.error("LOAD MESSAGES ERROR:", error);
    }
  }, [chatId, scrollToBottom]);

  // =========================================================
  // LOAD CHAT / FIND RECEIVER
  // =========================================================

  const loadChat = useCallback(async () => {
    if (!chatId) {
      console.error("LOAD CHAT: CHAT ID MISSING");
      return;
    }

    try {
      const data = await getChatById(chatId);

      console.log("CHAT RESPONSE:", data);

      if (!data?.success) {
        console.error("CHAT LOAD FAILED:", data);
        setReceiver(null);
        return;
      }

      const participants = Array.isArray(
        data?.chat?.participants
      )
        ? data.chat.participants
        : [];

      console.log("CHAT PARTICIPANTS:", participants);
      console.log("CURRENT USER ID:", currentUserId);

      if (participants.length === 0) {
        console.error("NO CHAT PARTICIPANTS");
        setReceiver(null);
        return;
      }

      const otherUser = participants.find(
        (participant: any) => {
          const participantId = String(
            participant?._id ||
              participant?.id ||
              ""
          );

          return (
            participantId &&
            participantId !== currentUserId
          );
        }
      );

      console.log("RECEIVER FOUND:", otherUser);

      setReceiver(otherUser || null);
    } catch (error) {
      console.error("LOAD CHAT ERROR:", error);
      setReceiver(null);
    }
  }, [chatId, currentUserId]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!userLoaded) {
      return;
    }

    async function initializeChat() {
      setLoading(true);

      try {
        if (!chatId) {
          console.error("CHAT ID MISSING");
          return;
        }

        if (!currentUserId) {
          console.error(
            "CURRENT USER ID MISSING",
            user
          );
          return;
        }

        await Promise.all([
          loadChat(),
          loadMessages(),
        ]);
      } catch (error) {
        console.error(
          "CHAT INITIALIZATION ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    initializeChat();
  }, [
    userLoaded,
    chatId,
    currentUserId,
    user,
    loadChat,
    loadMessages,
  ]);

  // =========================================================
  // RECEIVE NEW MESSAGES
  // =========================================================

  useEffect(() => {
    if (
      !userLoaded ||
      !chatId ||
      !currentUserId
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      loadMessages();
    }, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    userLoaded,
    chatId,
    currentUserId,
    loadMessages,
  ]);

  // =========================================================
  // EMOJI
  // =========================================================

  function handleEmojiClick(
    emojiData: EmojiClickData
  ) {
    setText((previous) => {
      return previous + emojiData.emoji;
    });

    setShowEmojiPicker(false);
  }

  // =========================================================
  // START REPLY
  // =========================================================

  function handleReply(message: any) {
    if (!message?._id) {
      return;
    }

    console.log(
      "REPLYING TO MESSAGE:",
      message
    );

    console.log(
      "REPLY MESSAGE ID:",
      message._id
    );

    setReplyingTo(message);

    setShowEmojiPicker(false);

    setTimeout(() => {
      const input =
        document.getElementById(
          "chat-message-input"
        ) as HTMLInputElement | null;

      input?.focus();
    }, 50);
  }

  // =========================================================
  // CANCEL REPLY
  // =========================================================

  function cancelReply() {
    setReplyingTo(null);
  }

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  async function handleSend() {
    const messageText = text.trim();

    if (!messageText) {
      return;
    }

    if (!chatId) {
      alert("Chat ID missing.");
      return;
    }

    if (!currentUserId) {
      alert("Logged-in user not found.");
      return;
    }

    const receiverId = String(
      receiver?._id ||
        receiver?.id ||
        ""
    );

    // =====================================================
    // IMPORTANT
    // Capture the reply ID BEFORE clearing reply state.
    // =====================================================

    const replyToId = replyingTo?._id
      ? String(replyingTo._id)
      : null;

    console.log(
      "========== SEND MESSAGE =========="
    );

    console.log("CHAT ID:", chatId);
    console.log(
      "CURRENT USER ID:",
      currentUserId
    );
    console.log("RECEIVER:", receiver);
    console.log(
      "RECEIVER ID:",
      receiverId
    );

    console.log(
      "REPLYING TO:",
      replyingTo
    );

    console.log(
      "REPLY TO ID:",
      replyToId || "NONE"
    );


    if (sending) {
      return;
    }

    setSending(true);

    // =====================================================
    // TEMPORARY MESSAGE
    // =====================================================

    const temporaryId = `temp-${Date.now()}`;

    const temporaryMessage = {
      _id: temporaryId,

      sender: {
        _id: currentUserId,
      },

      receiver: {
        _id: receiverId,
      },

      message: messageText,

      // Temporary reply information
      replyTo: replyingTo
        ? {
            _id: replyingTo._id,
            message:
              replyingTo.message || "",
            sender:
              replyingTo.sender || null,
          }
        : null,

      createdAt:
        new Date().toISOString(),

      isTemporary: true,
    };

    // =====================================================
    // SHOW MESSAGE IMMEDIATELY
    // =====================================================

    setMessages((previous) => [
      ...previous,
      temporaryMessage,
    ]);

    // =====================================================
    // CLEAR INPUT
    // =====================================================

    setText("");

    // =====================================================
    // CLOSE EMOJI PICKER
    // =====================================================

    setShowEmojiPicker(false);

    // =====================================================
    // CLOSE REPLY MODE
    // =====================================================

    setReplyingTo(null);

    scrollToBottom(true);

    try {
      // ===================================================
      // SEND MESSAGE TO BACKEND
      //
      // IMPORTANT:
      // The 4th argument is replyToId.
      // ===================================================

      const data = await sendMessage(
        chatId,
        messageText,
        replyToId
      );

      console.log(
        "SEND MESSAGE RESPONSE:",
        data
      );

      // ===================================================
      // SEND FAILED
      // ===================================================

      if (!data?.success) {
        console.error(
          "SEND MESSAGE FAILED:",
          data
        );

        // Remove temporary message
        setMessages((previous) =>
          previous.filter(
            (message) =>
              message._id !== temporaryId
          )
        );

        // Restore text
        setText(messageText);

        // Restore reply
        if (replyToId) {
          setReplyingTo({
            ...(replyingTo || {}),
            _id: replyToId,
          });
        }

        alert(
          data?.message ||
            "Message could not be sent."
        );

        return;
      }

      // ===================================================
      // REPLACE TEMP MESSAGE WITH REAL MESSAGE
      // ===================================================

      if (data?.message) {
        setMessages((previous) =>
          previous.map((message) =>
            message._id === temporaryId
              ? data.message
              : message
          )
        );
      }

      scrollToBottom(true);

      // ===================================================
      // GET SERVER'S LATEST VERSION
      // ===================================================

      await loadMessages();
    } catch (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error
      );

      // ===================================================
      // REMOVE TEMPORARY MESSAGE
      // ===================================================

      setMessages((previous) =>
        previous.filter(
          (message) =>
            message._id !== temporaryId
        )
      );

      // ===================================================
      // RESTORE TEXT
      // ===================================================

      setText(messageText);

      // ===================================================
      // RESTORE REPLY
      // ===================================================

      if (replyToId) {
        setReplyingTo({
          ...(replyingTo || {}),
          _id: replyToId,
        });
      }

      alert("Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  // =========================================================
  // ENTER KEY
  // =========================================================

  function handleKeyDown(
    event: React.KeyboardEvent
  ) {
    if (event.key === "Enter") {
      event.preventDefault();

      handleSend();
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen">

      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <Sidebar />

      {/* ====================================================
          MAIN AREA
      ==================================================== */}

      <div className="min-h-screen lg:ml-[268px]">

        <Navbar />

        <main
          className="
            flex
            h-[calc(100vh-80px)]
            min-h-0
            flex-col
            overflow-hidden
            px-3
            pb-3
            pt-3
            sm:px-4
            lg:px-6
            lg:pt-4
          "
        >

          {/* ==================================================
              CHAT HEADER
          ================================================== */}

          <div
            className="
              mb-3
              flex
              shrink-0
              items-center
              gap-3
              rounded-2xl
              bg-slate-900
              p-3
              sm:gap-4
              sm:p-4
              lg:p-5
            "
          >

            <button
              type="button"
              onClick={() =>
                router.push("/chat")
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                transition
                hover:bg-white/10
              "
            >
              <ArrowLeft
                className="text-white"
                size={22}
              />
            </button>

            <div className="min-w-0 flex-1">

              <h1
                className="
                  truncate
                  text-base
                  font-bold
                  text-white
                  sm:text-lg
                  lg:text-xl
                "
              >
                {receiver?.anonymousname ||
                  "Anonymous Friend"}
              </h1>

              <p
                className="
                  truncate
                  text-xs
                  text-gray-400
                  sm:text-sm
                "
              >
                Anonymous conversation
              </p>

            </div>

          </div>

          {/* ==================================================
              MESSAGES
          ================================================== */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overflow-x-hidden
              rounded-2xl
              bg-slate-900
              p-3
              sm:p-4
              lg:p-6
            "
          >

            {/* Loading */}

            {loading && (
              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                "
              >
                <p className="text-cyan-400">
                  Loading messages...
                </p>
              </div>
            )}

            {/* Empty */}

            {!loading &&
              messages.length === 0 && (
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center
                  "
                >
                  <p className="text-center text-gray-500">
                    No messages yet.
                    <br />
                    Start the conversation.
                  </p>
                </div>
              )}

            {/* Messages */}

            {!loading &&
              messages.length > 0 && (
                <div className="flex flex-col">

                  {messages.map(
                    (message) => (
                      <MessageBubble
                        key={String(
                          message._id
                        )}
                        message={message}
                        currentUserId={
                          currentUserId
                        }
                        onReply={
                          handleReply
                        }
                      />
                    )
                  )}

                </div>
              )}

            <div
              ref={messagesEndRef}
              className="h-1"
            />

          </div>

          {/* ==================================================
              INPUT AREA
          ================================================== */}

          <div
            className="
              relative
              mt-3
              shrink-0
              rounded-2xl
              border
              border-slate-700
              bg-slate-900
              p-2
              sm:p-3
            "
          >

            {/* =================================================
                REPLY PREVIEW
            ================================================= */}

            {replyingTo && (
              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-cyan-500/30
                  bg-slate-800
                  px-3
                  py-2
                "
              >

                <CornerUpLeft
                  size={18}
                  className="shrink-0 text-cyan-400"
                />

                <div className="min-w-0 flex-1">

                  <p className="text-xs font-semibold text-cyan-400">
                    Replying to{" "}
                    {replyingTo?.sender?.anonymousname ||
                      "message"}
                  </p>

                  <p
                    className="
                      truncate
                      text-sm
                      text-gray-300
                    "
                  >
                    {replyingTo?.message ||
                      "Message"}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={cancelReply}
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-gray-400
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                  aria-label="Cancel reply"
                >
                  <X size={18} />
                </button>

              </div>
            )}

            {/* =================================================
                INPUT ROW
            ================================================= */}

            <div
              className="
                flex
                items-center
                gap-2
                sm:gap-3
              "
            >

              {/* =================================================
                  EMOJI
              ================================================= */}

              <div
                ref={emojiPickerRef}
                className="relative shrink-0"
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker(
                      (previous) =>
                        !previous
                    )
                  }
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    text-gray-400
                    transition
                    hover:bg-slate-800
                    hover:text-white
                  "
                  aria-label="Open emoji picker"
                >
                  <Smile size={23} />
                </button>

                {showEmojiPicker && (
                  <div
                    className="
                      absolute
                      bottom-14
                      left-0
                      z-[9999]
                    "
                  >
                    <EmojiPicker
                      onEmojiClick={
                        handleEmojiClick
                      }
                      theme={Theme.DARK}
                      lazyLoadEmojis
                      width={350}
                      height={450}
                    />
                  </div>
                )}

              </div>

              {/* =================================================
                  TEXT INPUT
              ================================================= */}

              <input
                id="chat-message-input"
                type="text"
                value={text}
                onChange={(event) => {
                  setText(
                    event.target.value
                  );

                  if (showEmojiPicker) {
                    setShowEmojiPicker(
                      false
                    );
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  replyingTo
                    ? "Write a reply..."
                    : "Type your message..."
                }
                disabled={sending}
                className="
                  h-11
                  min-w-0
                  flex-1
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-800
                  px-3
                  text-sm
                  text-white
                  caret-cyan-400
                  outline-none
                  placeholder:text-gray-500
                  focus:border-cyan-500
                  focus:ring-1
                  focus:ring-cyan-500
                  sm:px-4
                  sm:text-base
                  disabled:opacity-60
                "
              />

              {/* =================================================
                  SEND BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={handleSend}
                disabled={
                  !text.trim() ||
                  sending
                }
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-600
                  text-white
                  transition
                  hover:bg-cyan-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                aria-label="Send message"
              >
                <Send size={20} />
              </button>

            </div>

          </div>

          {/* ==================================================
              SENDING
          ================================================== */}

          {sending && (
            <p
              className="
                mt-1
                shrink-0
                text-center
                text-xs
                text-cyan-400
              "
            >
              Sending message...
            </p>
          )}

        </main>

      </div>

    </div>
  );
}