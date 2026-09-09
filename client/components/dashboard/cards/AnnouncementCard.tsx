"use client";

import { motion } from "framer-motion";
import { Megaphone, ArrowRight } from "lucide-react";

export default function AnnouncementCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center gap-3">
        <Megaphone className="text-violet-400" size={26} />

        <h2 className="text-xl font-bold text-white">
          Announcements
        </h2>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white/5 p-4 transition hover:bg-white/10">
          <h3 className="font-semibold text-white">
            🎉 Community Event
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Join today's anonymous networking session at 7:00 PM.
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 p-4 transition hover:bg-white/10">
          <h3 className="font-semibold text-white">
            🚀 New Feature
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Friendship Passport is now available for every student.
          </p>
        </div>

        <button className="mt-3 flex items-center gap-2 font-semibold text-violet-400 transition hover:text-violet-300">
          View All
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}