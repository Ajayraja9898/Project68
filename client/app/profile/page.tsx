"use client";

import { API_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import {
  User,
  ShieldCheck,
  Star,
  Flame,
  Trophy,
  Search,
  Send,
} from "lucide-react";

interface ProfileUser {
  _id?: string;
  name?: string;
  rollNumber?: string;
  avatar?: string;
  department?: string;
  year?: number;
  role?: string;
  xp?: number;
  level?: number;
  streak?: number;
  achievements?: string[];
}

interface Student {
  _id?: string;
  name?: string;
  rollNumber?: string;
  avatar?: string;
  department?: string;
  year?: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [rollNumber, setRollNumber] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ======================================================
  // LOAD USER AFTER CLIENT HYDRATION
  // ======================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("PROFILE LOCALSTORAGE ERROR:", error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // ======================================================
  // SEARCH STUDENT
  // ======================================================

  async function searchStudent() {
    const searchRoll = rollNumber.trim();

    if (!searchRoll) {
      setMessage("Enter a roll number.");
      return;
    }

    setLoading(true);
    setMessage("");
    setStudent(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/invite/search/${encodeURIComponent(searchRoll)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("🔎 STUDENT SEARCH RESPONSE:", data);

      if (!data.success) {
        setMessage(data.message || "Student not found.");
      } else {
        setStudent(data.student);
      }
    } catch (error) {
      console.error("🔥 SEARCH STUDENT ERROR:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // SEND INVITE
  // ======================================================

  async function sendInvite() {
    const searchRoll = rollNumber.trim();

    if (!searchRoll) {
      setMessage("Enter a roll number.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/invite/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rollNumber: searchRoll,
        }),
      });

      const data = await res.json();

      console.log("📨 INVITE RESPONSE:", data);

      setMessage(
        data.message ||
          (data.success
            ? "Invite sent successfully."
            : "Unable to send invite.")
      );

      if (data.success) {
        setStudent(null);
        setRollNumber("");
      }
    } catch (error) {
      console.error("🔥 SEND INVITE ERROR:", error);
      setMessage("Unable to send invite.");
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // PROFILE VALUES
  // ======================================================

  const displayName = user?.name || "Student";
  const displayRollNumber = user?.rollNumber || "Roll Number";
  const displayRole = user?.role || "student";
  const displayLevel = user?.level ?? 1;
  const displayStreak = user?.streak ?? 0;

  const achievementCount = Array.isArray(user?.achievements)
    ? user.achievements.length
    : 0;

  const displayDepartment =
    user?.department || "CSE – Cyber Security";

  const displayYear = user?.year || 2;

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="ml-72 flex min-h-screen flex-1 flex-col">
        <Navbar />

        <main className="flex-1 bg-slate-950 p-8">
          <div className="mx-auto max-w-6xl space-y-10">

            {/* ==================================================
                PROFILE
            ================================================== */}

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">

              <div className="flex flex-col items-center gap-6 md:flex-row">

                {/* AVATAR */}

                <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-cyan-500">

                  {profileLoading ? (
                    <div className="h-10 w-10 animate-pulse rounded-full bg-white/20" />
                  ) : user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User
                      size={90}
                      className="text-white"
                    />
                  )}

                </div>

                {/* INFORMATION */}

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
                    Friendship Passport
                  </p>

                  <h1 className="mt-2 break-words text-5xl font-black text-white">
                    {displayName}
                  </h1>

                  <p className="mt-3 text-xl text-cyan-300">
                    {displayRollNumber}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">

                    <span className="rounded-lg bg-violet-500/10 px-3 py-1 text-xs font-bold capitalize text-violet-300">
                      {displayRole}
                    </span>

                    <span className="rounded-lg bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                      {displayDepartment}
                    </span>

                    <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-gray-300">
                      Year {displayYear}
                    </span>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  STATS
              ================================================== */}

              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

                {/* ROLE */}

                <div className="rounded-2xl bg-slate-800 p-6">
                  <ShieldCheck
                    className="mb-3 text-violet-400"
                    size={35}
                  />

                  <p className="text-gray-400">
                    Role
                  </p>

                  <h2 className="text-2xl font-bold capitalize text-white">
                    {displayRole}
                  </h2>
                </div>

                {/* LEVEL */}

                <div className="rounded-2xl bg-slate-800 p-6">
                  <Star
                    className="mb-3 text-yellow-400"
                    size={35}
                  />

                  <p className="text-gray-400">
                    Level
                  </p>

                  <h2 className="text-2xl font-bold text-white">
                    {displayLevel}
                  </h2>
                </div>

                {/* STREAK */}

                <div className="rounded-2xl bg-slate-800 p-6">
                  <Flame
                    className="mb-3 text-orange-400"
                    size={35}
                  />

                  <p className="text-gray-400">
                    Current Streak
                  </p>

                  <h2 className="text-2xl font-bold text-white">
                    {displayStreak}{" "}
                    {displayStreak === 1 ? "Day" : "Days"}
                  </h2>
                </div>

                {/* ACHIEVEMENTS */}

                <div className="rounded-2xl bg-slate-800 p-6">
                  <Trophy
                    className="mb-3 text-cyan-400"
                    size={35}
                  />

                  <p className="text-gray-400">
                    Achievements
                  </p>

                  <h2 className="text-2xl font-bold text-white">
                    {achievementCount}
                  </h2>
                </div>

              </div>
            </div>

            {/* ==================================================
                FIND STUDENT
            ================================================== */}

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">

              <h2 className="mb-2 text-3xl font-bold text-white">
                Find Student
              </h2>

              <p className="mb-6 text-sm text-gray-500">
                Search for another student using their roll number.
              </p>

              {/* SEARCH */}

              <div className="flex flex-col gap-4 sm:flex-row">

                <input
                  value={rollNumber}
                  onChange={(event) =>
                    setRollNumber(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      searchStudent();
                    }
                  }}
                  placeholder="Enter Roll Number"
                  disabled={loading}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-800 p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-violet-500 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={searchStudent}
                  disabled={
                    loading ||
                    !rollNumber.trim()
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-4 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Search size={20} />

                  {loading
                    ? "Searching..."
                    : "Search"}
                </button>

              </div>

              {/* MESSAGE */}

              {message && (
                <div className="mt-5 rounded-xl border border-white/10 bg-slate-800 p-4">
                  <p className="text-sm text-cyan-300">
                    {message}
                  </p>
                </div>
              )}

              {/* STUDENT */}

              {student && (
                <div className="mt-8 rounded-2xl border border-white/10 bg-slate-800 p-6">

                  <p className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    Student Found
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-white">
                    {student.name || "Student"}
                  </h3>

                  <p className="mt-2 text-cyan-300">
                    {student.rollNumber || rollNumber}
                  </p>

                  <p className="mt-3 text-gray-300">
                    Department:{" "}
                    <span className="font-semibold text-cyan-400">
                      {student.department || "N/A"}
                    </span>
                  </p>

                  <p className="text-gray-300">
                    Year:{" "}
                    <span className="font-semibold text-cyan-400">
                      {student.year || "N/A"}
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={sendInvite}
                    disabled={loading}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={20} />

                    {loading
                      ? "Sending..."
                      : "Send Anonymous Invite"}
                  </button>

                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
