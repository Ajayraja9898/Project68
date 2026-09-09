"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  rollNumber: string;
  role: string;
}

export default function WelcomeCard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning ☀️"
      : hour < 18
      ? "Good Afternoon 🌤️"
      : "Good Evening 🌙";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 p-8 shadow-xl"
    >
      <div className="space-y-4">
        <p className="text-lg text-white/80">{greeting}</p>

        <div>
          <h1 className="text-4xl font-black text-white">
            Welcome back, {user?.name || "Student"} 👋
          </h1>

          <p className="mt-2 text-lg text-cyan-200">
            Roll Number : {user?.rollNumber || "Loading..."}
          </p>
        </div>

        <p className="max-w-2xl text-white/80">
          Ready to meet someone new? Start an anonymous conversation,
          complete today's challenge, and keep your streak alive.
        </p>

        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-sm text-white/70">Level</p>
            <h2 className="text-2xl font-bold text-white">1</h2>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-sm text-white/70">XP</p>
            <h2 className="text-2xl font-bold text-white">0</h2>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-sm text-white/70">Role</p>
            <h2 className="text-2xl font-bold capitalize text-white">
              {user?.role || "Student"}
            </h2>
          </div>
        </div>
      </div>
    </motion.div>
  );
}