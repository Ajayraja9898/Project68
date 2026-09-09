"use client";

import { motion, type Variants } from "framer-motion";

import AuroraBackground from "../components/background/AuroraBackground";
import LoginCard from "../components/auth/LoginCard";
import Project68Logo from "../components/logo/Project68Logo";

const features = [
  {
    icon: "🛡️",
    title: "Anonymous Conversations",
    description:
      "Meet classmates without knowing their identity.",
  },
  {
    icon: "🔥",
    title: "Daily Streak System",
    description:
      "Maintain conversations to unlock identities after 100 days.",
  },
  {
    icon: "👥",
    title: "Community Lounge",
    description:
      "A shared group chat for all 68 classmates.",
  },
];

/* ======================================================
   PAGE ANIMATION VARIANTS
====================================================== */

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut",
    },
  },
};

/* ======================================================
   HOME PAGE
====================================================== */

export default function Home() {
  return (
    <AuroraBackground>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-[1700px]
          items-center
          justify-center
          gap-16
          px-6
          py-10
          lg:flex-row
          lg:gap-24
          lg:px-12
        "
      >
        {/* ==================================================
            LEFT SIDE
        ================================================== */}

        <motion.div
          variants={itemVariants}
          className="hidden w-full max-w-2xl lg:block"
        >
          {/* ==================================================
              PROJECT68 LOGO
          ================================================== */}

          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Project68Logo />
          </motion.div>

          {/* ==================================================
              INTRO TEXT
          ================================================== */}

          <motion.p
            variants={itemVariants}
            className="mt-10 text-lg leading-8 text-gray-400"
          >
            Welcome to{" "}
            <span className="font-semibold text-violet-300">
              Project68
            </span>
            , a platform designed exclusively for your class
            to build new friendships through anonymous
            conversations.
          </motion.p>

          {/* ==================================================
              FEATURE CARDS
          ================================================== */}

          <motion.div
            variants={containerVariants}
            className="mt-10 space-y-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{
                  x: 8,
                  scale: 1.015,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 22,
                }}
                className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  p-4
                  backdrop-blur-xl
                  transition-colors
                  duration-300
                  hover:bg-white/[0.08]
                "
              >
                <motion.span
                  animate={{
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-2xl"
                >
                  {feature.icon}
                </motion.span>

                <div>
                  <h3 className="font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <motion.div
          variants={itemVariants}
          className="w-full max-w-xl"
        >
          <LoginCard />
        </motion.div>
      </motion.div>
    </AuroraBackground>
  );
}