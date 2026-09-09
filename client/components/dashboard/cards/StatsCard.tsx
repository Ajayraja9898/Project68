"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: ReactNode;
  color?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.55,
        ease: "easeOut",
      }}
      whileHover={{
        y: -6,
        scale: 1.015,
      }}
      whileTap={{
        scale: 0.99,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
        transition-colors
        duration-300
        hover:bg-white/[0.08]
      "
    >
      {/* Soft hover glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-3xl
          bg-gradient-to-br
          from-violet-500/10
          via-transparent
          to-cyan-500/10
        "
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <motion.h2
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              ease: "easeOut",
            }}
            className="
              mt-2
              text-4xl
              font-bold
              text-white
            "
          >
            {value}
          </motion.h2>

          <p className="mt-1 text-sm text-gray-500">
            {subtitle}
          </p>
        </div>

        <motion.div
          whileHover={{
            scale: 1.12,
            rotate: 4,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 18,
          }}
          className="
            shrink-0
            transition-transform
            duration-300
          "
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
}