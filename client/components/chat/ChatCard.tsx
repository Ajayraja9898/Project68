"use client";

import { MessageCircle } from "lucide-react";

interface ChatCardProps {
  chat: any;
  onClick: () => void;
}

export default function ChatCard({
  chat,
  onClick,
}: ChatCardProps) {

  const otherUser = chat.participants[1] || chat.participants[0];

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-3xl bg-slate-900 p-6 transition hover:bg-slate-800"
    >
      <div className="flex items-center gap-5">

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500">
          <MessageCircle className="text-white" size={30} />
        </div>

        <div className="flex-1">

          <h2 className="text-xl font-bold text-white">
            Anonymous Friend
          </h2>

          <p className="mt-1 text-gray-400">
            {chat.lastMessage || "Start your conversation"}
          </p>

        </div>

      </div>
    </div>
  );
}