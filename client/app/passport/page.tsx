"use client";

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

import { getMyProfile } from "@/services/profileService";
import { API_URL } from "@/lib/api";

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

export default function PassportPage() {
  const [mounted, setMounted] = useState(false);

  const [user, setUser] =
    useState<ProfileUser | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [profileError, setProfileError] =
    useState("");

  const [rollNumber, setRollNumber] =
    useState("");

  const [student, setStudent] =
    useState<Student | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        setProfileLoading(true);
        setProfileError("");

        const data = await getMyProfile();

        if (cancelled) {
          return;
        }

        if (data?.success && data?.user) {
          setUser(data.user);

          try {
            const existingUser =
              JSON.parse(
                localStorage.getItem("user") || "{}"
              );

            localStorage.setItem(
              "user",
              JSON.stringify({
                ...existingUser,
                ...data.user,
              })
            );
          } catch (error) {
            console.error(
              "Unable to update localStorage user:",
              error
            );
          }
        } else {
          setProfileError(
            data?.message ||
              "Unable to load profile."
          );
        }
      } catch (error) {
        console.error(
          "PASSPORT PROFILE ERROR:",
          error
        );

        if (!cancelled) {
          setProfileError(
            "Unable to load profile."
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  async function searchStudent() {
    const searchRoll =
      rollNumber.trim();

    if (!searchRoll) {
      setMessage(
        "Enter a roll number."
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setStudent(null);

    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/invite/search/${encodeURIComponent(
          searchRoll
        )}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      if (!data.success) {
        setMessage(
          data.message ||
            "Student not found."
        );
      } else {
        setStudent(data.student);
      }
    } catch (error) {
      console.error(
        "STUDENT SEARCH ERROR:",
        error
      );

      setMessage(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendInvite() {
    const searchRoll =
      rollNumber.trim();

    if (!searchRoll) {
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/invite/send`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            rollNumber: searchRoll,
          }),
        }
      );

      const data =
        await res.json();

      setMessage(
        data.message ||
          "Invite request completed."
      );

      if (data.success) {
        setStudent(null);
        setRollNumber("");
      }
    } catch (error) {
      console.error(
        "SEND INVITE ERROR:",
        error
      );

      setMessage(
        "Unable to send invite."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchStudent();
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />

        <div className="ml-72 flex min-w-0 flex-1 flex-col">
          <Navbar />

          <main className="flex-1 bg-slate-950 p-6 md:p-8">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
                <p className="text-center text-cyan-400">
                  Loading Passport...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const displayName =
    user?.name || "Student";

  const displayRollNumber =
    user?.rollNumber || "Roll Number";

  const displayRole =
    user?.role || "student";

  const displayLevel =
    typeof user?.level === "number"
      ? user.level
      : 1;

  const displayXP =
    typeof user?.xp === "number"
      ? user.xp
      : 0;

  const displayStreak =
    typeof user?.streak === "number"
      ? user.streak
      : 0;

  const achievementCount =
    Array.isArray(user?.achievements)
      ? user.achievements.length
      : 0;

  const displayDepartment =
    user?.department ||
    "Not specified";

  const displayYear =
    user?.year ||
    "Not specified";

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="ml-72 flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 bg-slate-950 p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-8">

            {profileLoading && (
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-8">
                <p className="text-center text-cyan-400">
                  Loading Passport...
                </p>
              </div>
            )}

            {profileError &&
              !profileLoading && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                  <p className="font-semibold text-red-400">
                    {profileError}
                  </p>
                </div>
              )}

            {!profileLoading && (
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl md:p-8">

                <div className="flex flex-col items-center gap-6 md:flex-row">

                  <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-cyan-500">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User
                        size={80}
                        className="text-white"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-center md:text-left">

                    <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
                      Friendship Passport
                    </p>

                    <h1 className="mt-2 break-words text-4xl font-black text-white md:text-5xl">
                      {displayName}
                    </h1>

                    <p className="mt-2 text-lg font-semibold text-cyan-300">
                      {displayRollNumber}
                    </p>

                    <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">

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

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <div className="rounded-2xl border border-white/5 bg-slate-800 p-5">
                    <Star
                      className="mb-3 text-yellow-400"
                      size={32}
                    />
                    <p className="text-sm text-gray-400">
                      Level
                    </p>
                    <h2 className="mt-1 text-3xl font-black text-white">
                      {displayLevel}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Current level
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-slate-800 p-5">
                    <ShieldCheck
                      className="mb-3 text-violet-400"
                      size={32}
                    />
                    <p className="text-sm text-gray-400">
                      XP
                    </p>
                    <h2 className="mt-1 text-3xl font-black text-white">
                      {displayXP}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Experience points
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-slate-800 p-5">
                    <Flame
                      className="mb-3 text-orange-400"
                      size={32}
                    />
                    <p className="text-sm text-gray-400">
                      Current Streak
                    </p>
                    <h2 className="mt-1 text-3xl font-black text-white">
                      {displayStreak}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {displayStreak === 1
                        ? "Day"
                        : "Days"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-slate-800 p-5">
                    <Trophy
                      className="mb-3 text-cyan-400"
                      size={32}
                    />
                    <p className="text-sm text-gray-400">
                      Achievements
                    </p>
                    <h2 className="mt-1 text-3xl font-black text-white">
                      {achievementCount}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Unlocked achievements
                    </p>
                  </div>

                </div>
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 md:p-8">

              <h2 className="text-3xl font-black text-white">
                Find Student
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Search for another student using their roll number.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <input
                  value={rollNumber}
                  onChange={(event) =>
                    setRollNumber(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleSearchKeyDown
                  }
                  placeholder="Enter Roll Number"
                  disabled={loading}
                  className="
                    min-w-0
                    flex-1
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-800
                    p-4
                    text-white
                    outline-none
                    transition
                    placeholder:text-gray-500
                    focus:border-violet-500
                    disabled:opacity-50
                  "
                />

                <button
                  type="button"
                  onClick={searchStudent}
                  disabled={
                    loading ||
                    !rollNumber.trim()
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-violet-600
                    px-6
                    py-4
                    font-bold
                    text-white
                    transition
                    hover:bg-violet-500
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <Search size={20} />

                  {loading
                    ? "Searching..."
                    : "Search"}
                </button>

              </div>

              {message && (
                <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
                  {message}
                </div>
              )}

              {student && (
                <div className="mt-8 rounded-2xl border border-white/10 bg-slate-800 p-6">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">

                      <p className="text-xs font-bold uppercase tracking-wider text-violet-400">
                        Student Found
                      </p>

                      <h3 className="mt-1 break-words text-xl font-black text-white">
                        {student.name || "Student"}
                      </h3>

                      <p className="mt-1 text-sm text-cyan-300">
                        {student.rollNumber ||
                          rollNumber}
                      </p>

                      <div className="mt-3 space-y-1 text-sm text-gray-400">
                        <p>
                          Department:{" "}
                          {student.department ||
                            "N/A"}
                        </p>

                        <p>
                          Year:{" "}
                          {student.year ||
                            "N/A"}
                        </p>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={sendInvite}
                      disabled={loading}
                      className="
                        flex
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-cyan-600
                        px-6
                        py-3
                        font-bold
                        text-white
                        transition
                        hover:bg-cyan-500
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <Send size={20} />

                      {loading
                        ? "Sending..."
                        : "Send Anonymous Invite"}
                    </button>

                  </div>

                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
