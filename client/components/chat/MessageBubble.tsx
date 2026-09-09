"use client";

import { Reply } from "lucide-react";

interface MessageBubbleProps {
  message: any;
  currentUserId: string;
  onReply: (message: any) => void;
}

export default function MessageBubble({
  message,
  currentUserId,
  onReply,
}: MessageBubbleProps) {
  // ======================================================
  // DETERMINE WHETHER MESSAGE BELONGS TO CURRENT USER
  // ======================================================

  const isMine =
    typeof message?.sender?.isMe === "boolean"
      ? message.sender.isMe
      : String(
          message?.sender?._id ||
            message?.sender?.id ||
            message?.sender ||
            ""
        ) === String(currentUserId || "");

  // ======================================================
  // REPLY DATA
  // ======================================================

  const repliedMessage = message?.replyTo || null;

  const replyAuthor =
    repliedMessage?.anonymousName ||
    repliedMessage?.sender?.anonymousName ||
    "Anonymous";

  // ======================================================
  // TIME
  // ======================================================

  const formattedTime = message?.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // ======================================================
  // UI
  // ======================================================

  return (
    <div
      className={`mb-3 flex w-full ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`w-fit max-w-[85%] overflow-hidden break-words rounded-2xl px-4 py-3 shadow-sm lg:max-w-[70%] ${
          isMine
            ? "bg-cyan-600 text-white"
            : "bg-slate-800 text-white"
        }`}
      >
        {/* ==================================================
            REPLIED MESSAGE
        ================================================== */}

        {repliedMessage && (
          <div
            className={`mb-3 overflow-hidden rounded-xl border-l-4 px-3 py-2 ${
              isMine
                ? "border-cyan-200 bg-cyan-700/70"
                : "border-cyan-400 bg-slate-700/80"
            }`}
          >
            <div className="flex items-center gap-2">
              <Reply
                size={14}
                className="shrink-0 opacity-80"
              />

              <p className="truncate text-xs font-bold">
                {replyAuthor}
              </p>
            </div>

            <p className="mt-1 line-clamp-2 text-xs opacity-75">
              {repliedMessage?.message || "Message"}
            </p>
          </div>
        )}

        {/* ==================================================
            MAIN MESSAGE
        ================================================== */}

        <div
          className="
            whitespace-pre-wrap
            break-words
            text-sm
            leading-relaxed
            lg:text-base
          "
        >
          {message?.message || ""}
        </div>

        {/* ==================================================
            BOTTOM ROW
        ================================================== */}

        <div className="mt-2 flex items-center justify-between gap-4">
          {/* Reply */}

          <button
            type="button"
            onClick={() => onReply(message)}
            className="
              flex
              items-center
              gap-1
              rounded-lg
              px-2
              py-1
              text-[10px]
              font-semibold
              opacity-70
              transition
              hover:bg-white/10
              hover:opacity-100
              lg:text-xs
            "
          >
            <Reply size={13} />

            <span>Reply</span>
          </button>

          {/* Time */}

          <p
            className="
              shrink-0
              text-right
              text-[10px]
              opacity-70
              lg:text-xs
            "
          >
            {formattedTime}
          </p>
        </div>
      </div>
    </div>
  );
}