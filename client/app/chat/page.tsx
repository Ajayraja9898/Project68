"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import ChatCard from "@/components/chat/ChatCard";
import { getUserChats } from "@/services/chatService";

export default function ChatPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    async function loadChats() {
      try {
        const data = await getUserChats();

        console.log("CHATS FROM SERVER:", data);

        if (data.success && Array.isArray(data.chats)) {
          // Only keep chats with a real MongoDB ObjectId.
          const validChats = data.chats.filter(
            (chat: any) =>
              typeof chat?._id === "string" &&
              /^[a-fA-F0-9]{24}$/.test(chat._id)
          );

          console.log("VALID CHATS:", validChats);

          setChats(validChats);
        } else {
          setChats([]);
          console.error("GET CHATS FAILED:", data);
        }
      } catch (error) {
        console.error("LOAD CHATS ERROR:", error);
        setChats([]);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, []);

  function openChat(chat: any) {
    const id = String(chat?._id || "");

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      console.error("INVALID CHAT ID:", chat);
      alert("This chat has an invalid ID. Please create/accept the chat again.");
      return;
    }

    console.log("OPENING CHAT:", id);

    router.push(`/chat/${id}`);
  }

  return (
    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Navbar />

        <main className="flex-1 p-8">

          <div className="mx-auto max-w-5xl">

            <h1 className="mb-8 text-4xl font-black text-white">
              Anonymous Chats
            </h1>

            {loading && (
              <p className="text-cyan-400">
                Loading chats...
              </p>
            )}

            {!loading && chats.length === 0 && (
              <div className="rounded-3xl bg-slate-900 p-10 text-center">

                <h2 className="text-2xl font-bold text-white">
                  No Chats Yet
                </h2>

                <p className="mt-3 text-gray-400">
                  Accept an anonymous invite to start chatting.
                </p>

              </div>
            )}

            {!loading && chats.length > 0 && (
              <div className="space-y-5">

                {chats.map((chat) => (
                  <ChatCard
                    key={String(chat._id)}
                    chat={chat}
                    onClick={() => openChat(chat)}
                  />
                ))}

              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}