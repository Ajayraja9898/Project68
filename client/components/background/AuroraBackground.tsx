"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

import FloatingParticles from "./FloatingParticles";

export default function AuroraBackground({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-black" />

      {/* Purple aurora */}
      <motion.div
        animate={{
          x: [0, 80, 30, -40, 0],
          y: [0, 40, 100, 50, 0],
          scale: [1, 1.08, 0.96, 1.04, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -left-52
          -top-52
          h-[650px]
          w-[650px]
          rounded-full
          bg-purple-500/30
          blur-[150px]
        "
      />

      {/* Indigo aurora */}
      <motion.div
        animate={{
          x: [0, -70, -110, -50, 0],
          y: [0, 40, 80, 30, 0],
          scale: [1, 1.06, 0.96, 1.05, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -right-40
          -top-20
          h-[550px]
          w-[550px]
          rounded-full
          bg-indigo-500/20
          blur-[140px]
        "
      />

      {/* Cyan aurora */}
      <motion.div
        animate={{
          x: [0, -60, -120, -40, 0],
          y: [0, -40, 30, -20, 0],
          scale: [1, 1.08, 0.94, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -bottom-40
          -right-40
          h-[650px]
          w-[650px]
          rounded-full
          bg-cyan-500/20
          blur-[150px]
        "
      />

      {/* Center glow */}
      <motion.div
        animate={{
          scale: [0.95, 1.1, 0.95],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-[420px]
          w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-violet-500/10
          blur-[130px]
        "
      />

      {/* Grid */}
      <div
        className="
          absolute
          inset-0
          opacity-30
          bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]
          bg-[size:45px_45px]
        "
      />

      {/* Particles */}
      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        {children}
      </div>
    </div>
  );
}