"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageCircle,
  Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeroCard() {
  const router = useRouter();

  // ======================================================
  // START CHAT
  // ======================================================

  const handleStartChat = () => {
    router.push("/chat");
  };

  // ======================================================
  // FIND NEW PARTNER
  // ======================================================

  const handleFindPartner = () => {
    router.push("/partner");
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
      }}
      className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-700 via-indigo-700 to-cyan-700 p-8 shadow-2xl"
    >
      {/* ==================================================
          BACKGROUND GLOW
      ================================================== */}

      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* ==================================================
            LEFT CONTENT
        ================================================== */}

        <div className="max-w-2xl">
          {/* Badge */}

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            <MessageCircle size={16} />

            Anonymous Chat
          </div>

          {/* Heading */}

          <h2 className="text-4xl font-black text-white lg:text-5xl">
            Meet Someone New Today
          </h2>

          {/* Description */}

          <p className="mt-5 text-lg text-white/80">
            Connect anonymously with verified
            students, make new friendships,
            complete daily challenges, and keep
            your streak alive.
          </p>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="mt-8 flex flex-wrap gap-4">
            {/* Start Chat */}

            <button
              type="button"
              onClick={handleStartChat}
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:scale-105 hover:bg-gray-100"
            >
              Start Chat

              <ArrowRight size={18} />
            </button>

            {/* Find New Partner */}

            <button
              type="button"
              onClick={handleFindPartner}
              className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20 hover:scale-105"
            >
              Find New Partner
            </button>
          </div>
        </div>

        {/* ==================================================
            STREAK
        ================================================== */}

        <div className="flex items-center justify-center">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <Flame
                className="text-orange-400"
                size={34}
              />

              <div>
                <p className="text-sm text-white/70">
                  Current Streak
                </p>

                <h3 className="text-4xl font-black text-white">
                  14 Days
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}