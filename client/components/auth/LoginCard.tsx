"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";

export default function LoginCard() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [rollNumber, setRollNumber] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ======================================================
  // LOGIN
  // ======================================================

  const handleLogin = async () => {
    if (
      !rollNumber.trim() ||
      !password.trim()
    ) {
      alert(
        "Please enter Roll Number and Password."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rollNumber:
              rollNumber.trim().toUpperCase(),
            password,
          }),
        }
      );

      const contentType =
        res.headers.get("content-type");

      if (
        !contentType ||
        !contentType.includes(
          "application/json"
        )
      ) {
        const html =
          await res.text();

        console.error(
          "Expected JSON but received:",
          html
        );

        alert(
          "Backend returned an invalid response. Check your server."
        );

        return;
      }

      const data =
        await res.json();

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      // ==================================================
      // LOGIN FAILED
      // ==================================================

      if (!res.ok) {
        alert(
          data?.message ||
            "Login Failed"
        );

        return;
      }

      // ==================================================
      // CLEAR PREVIOUS ANONYMOUS IDENTITY
      // ==================================================

      sessionStorage.removeItem(
        "communityAnonymousName"
      );

      // ==================================================
      // GENERATE NEW ANONYMOUS IDENTITY
      // ==================================================

      const anonymousNumber =
        Math.floor(
          1000 +
            Math.random() * 9000
        );

      const anonymousName =
        `Anonymous ${anonymousNumber}`;

      sessionStorage.setItem(
        "communityAnonymousName",
        anonymousName
      );

      console.log(
        "🕵️ NEW ANONYMOUS IDENTITY:",
        anonymousName
      );

      // ==================================================
      // SAVE TOKEN
      // ==================================================

      if (data?.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      // ==================================================
      // SAVE USER
      // ==================================================

      if (data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      alert(
        `🎉 Login Successful!\n\nYour anonymous identity is ${anonymousName}`
      );

      // ==================================================
      // ROLE REDIRECT
      // ==================================================

      if (
        data?.user?.role ===
        "admin"
      ) {
        window.location.href =
          "/admin";
      } else {
        window.location.href =
          "/dashboard";
      }
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      alert(
        "Unable to connect to backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.75,
        ease: "easeOut",
      }}
      whileHover={{
        y: -4,
      }}
      className="
        w-full
        max-w-[540px]
        rounded-[36px]
        border
        border-white/10
        bg-white/10
        p-8
        shadow-[0_0_70px_rgba(139,92,246,0.35)]
        backdrop-blur-3xl
        sm:p-10
        lg:p-12
      "
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-12 text-center">

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.7,
            rotate: -8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
            y: [0, -7, 0],
            boxShadow: [
              "0 0 30px rgba(139,92,246,0.45)",
              "0 0 55px rgba(139,92,246,0.8)",
              "0 0 30px rgba(139,92,246,0.45)",
            ],
          }}
          transition={{
            opacity: {
              delay: 0.25,
              duration: 0.7,
              ease: "easeOut",
            },
            scale: {
              delay: 0.25,
              duration: 0.7,
              ease: "easeOut",
            },
            rotate: {
              delay: 0.25,
              duration: 0.7,
              ease: "easeOut",
            },
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
            boxShadow: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="
            mx-auto
            mb-6
            flex
            h-24
            w-24
            items-center
            justify-center
            rounded-full
            bg-gradient-to-r
            from-violet-600
            via-purple-600
            to-cyan-500
          "
        >
          <span className="text-5xl font-black text-white">
            68
          </span>
        </motion.div>

        <motion.h1
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.35,
            duration: 0.6,
          }}
          className="
            text-4xl
            font-black
            tracking-wider
            text-white
            sm:text-5xl
          "
        >
          PROJECT68
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.5,
            duration: 0.6,
          }}
          className="mt-4 text-lg text-gray-300"
        >
          One Class. Infinite Connections.
        </motion.p>

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.6,
            duration: 0.6,
          }}
          className="
            mt-3
            text-sm
            uppercase
            tracking-[0.45em]
            text-violet-300
          "
        >
          A DeadSec Original
        </motion.p>

      </div>

      {/* ==================================================
          ROLL NUMBER
      ================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: -20,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          delay: 0.65,
          duration: 0.55,
        }}
        className="relative mb-8"
      >
        <HiOutlineUser
          className="
            absolute
            left-5
            top-1/2
            -translate-y-1/2
            text-2xl
            text-violet-300
          "
        />

        <input
          type="text"
          placeholder="Roll Number"
          value={rollNumber}
          onChange={(e) =>
            setRollNumber(
              e.target.value
            )
          }
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/5
            py-5
            pl-14
            pr-5
            text-lg
            text-white
            outline-none
            transition-all
            duration-300
            placeholder:text-lg
            placeholder:text-gray-400
            focus:border-violet-400
            focus:bg-white/10
            focus:ring-2
            focus:ring-violet-500/20
          "
        />
      </motion.div>

      {/* ==================================================
          PASSWORD
      ================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: 20,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          delay: 0.75,
          duration: 0.55,
        }}
        className="relative mb-8"
      >
        <HiOutlineLockClosed
          className="
            absolute
            left-5
            top-1/2
            -translate-y-1/2
            text-2xl
            text-violet-300
          "
        />

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter"
            ) {
              handleLogin();
            }
          }}
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/5
            py-5
            pl-14
            pr-14
            text-lg
            text-white
            outline-none
            transition-all
            duration-300
            placeholder:text-lg
            placeholder:text-gray-400
            focus:border-violet-400
            focus:bg-white/10
            focus:ring-2
            focus:ring-violet-500/20
          "
        />

        <motion.button
          type="button"
          whileTap={{
            scale: 0.9,
          }}
          onClick={() =>
            setShowPassword(
              (previous) =>
                !previous
            )
          }
          className="
            absolute
            right-5
            top-1/2
            -translate-y-1/2
            text-violet-300
            transition
            hover:text-white
          "
        >
          {showPassword ? (
            <HiOutlineEyeOff
              size={26}
            />
          ) : (
            <HiOutlineEye
              size={26}
            />
          )}
        </motion.button>
      </motion.div>

      {/* ==================================================
          LOGIN BUTTON
      ================================================== */}

      <motion.button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        whileHover={{
          scale: 1.02,
        }}
        whileTap={{
          scale: 0.97,
        }}
        className="
          mb-8
          w-full
          rounded-2xl
          bg-gradient-to-r
          from-violet-600
          via-purple-600
          to-cyan-500
          py-5
          text-xl
          font-bold
          text-white
          shadow-lg
          shadow-violet-500/20
          transition-all
          duration-300
          hover:shadow-[0_0_35px_rgba(139,92,246,0.8)]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading
          ? "Signing In..."
          : "Continue →"}
      </motion.button>

      {/* ==================================================
          REGISTER DIVIDER
      ================================================== */}

      <div className="mb-8 flex items-center gap-4">

        <div className="h-px flex-1 bg-white/10" />

        <span className="
          text-sm
          uppercase
          tracking-[0.3em]
          text-gray-400
        ">
          New Here?
        </span>

        <div className="h-px flex-1 bg-white/10" />

      </div>

      {/* ==================================================
          CREATE ACCOUNT
      ================================================== */}

      <motion.button
        type="button"
        whileHover={{
          scale: 1.01,
        }}
        whileTap={{
          scale: 0.98,
        }}
        onClick={() =>
          (window.location.href =
            "/register")
        }
        className="
          w-full
          rounded-2xl
          border
          border-violet-400/30
          py-5
          text-lg
          font-semibold
          text-violet-300
          transition-all
          duration-300
          hover:bg-violet-500/10
          hover:text-white
          hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]
        "
      >
        Create Account
      </motion.button>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <p className="
        mt-10
        text-center
        text-sm
        text-gray-400
      ">
        68 Students • Anonymous • Secure
      </p>

    </motion.div>
  );
}
