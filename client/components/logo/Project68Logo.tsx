"use client";

import { motion } from "framer-motion";

export default function Project68Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center"
    >
      {/* Animated Ring */}
      <div className="relative flex h-32 w-32 items-center justify-center">

        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute h-32 w-32 rounded-full border-2 border-violet-500/40"
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute h-24 w-24 rounded-full border border-cyan-400/40"
        />

        {/* Center */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 0 20px rgba(139,92,246,0.5)",
              "0 0 45px rgba(139,92,246,1)",
              "0 0 20px rgba(139,92,246,0.5)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500"
        >
          <span className="text-3xl font-black text-white">
            68
          </span>
        </motion.div>
      </div>

      <h1 className="mt-6 text-5xl font-black tracking-wider text-white">
        PROJECT
        <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
          68
        </span>
      </h1>

      <p className="mt-3 text-lg text-gray-300">
        One Class. Infinite Connections.
      </p>

      <p className="mt-2 text-xs uppercase tracking-[0.45em] text-violet-300">
        A DeadSec Original
      </p>
    </motion.div>
  );
}