"use client";

import { ReactNode } from "react";
import {
  motion,
  type Variants,
} from "framer-motion";

interface DashboardAnimationsProps {
  children: ReactNode;
}

const dashboardContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export const dashboardItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function DashboardAnimations({
  children,
}: DashboardAnimationsProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={dashboardContainerVariants}
    >
      {children}
    </motion.div>
  );
}