"use client";

import { useEffect, useState } from "react";

import {
  Award,
  CheckCircle,
  Lock,
  Trophy,
  Star,
  Loader2,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

import {
  getAchievements,
} from "@/services/achievementService";

// ======================================================
// TYPES
// ======================================================

interface Achievement {
  _id: string;

  name?: string;

  title?: string;

  description?: string;

  icon?: string;

  badge?: string;

  category?: string;

  points?: number;

  requirement?: string;

  progress?: number;

  target?: number;

  unlocked?: boolean;

  isUnlocked?: boolean;

  completed?: boolean;

  createdAt?: string;

  updatedAt?: string;
}

// ======================================================
// PAGE
// ======================================================

export default function AchievementsPage() {
  const [achievements, setAchievements] =
    useState<Achievement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // LOAD ACHIEVEMENTS
  // ====================================================

  useEffect(() => {
    async function loadAchievements() {
      try {
        setLoading(true);

        setError("");

        console.log(
          "🏆 Loading achievements..."
        );

        const data =
          await getAchievements();

        console.log(
          "🏆 Achievement response:",
          data
        );

        if (data?.success) {
          setAchievements(
            Array.isArray(
              data.achievements
            )
              ? data.achievements
              : []
          );
        } else {
          setError(
            data?.message ||
              "Unable to load achievements."
          );
        }
      } catch (error) {
        console.error(
          "🔥 ACHIEVEMENT LOAD ERROR:",
          error
        );

        setError(
          "Unable to connect to the achievement server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, []);

  // ====================================================
  // HELPERS
  // ====================================================

  function getTitle(
    achievement: Achievement
  ) {
    return (
      achievement.title ||
      achievement.name ||
      "Achievement"
    );
  }

  function getDescription(
    achievement: Achievement
  ) {
    return (
      achievement.description ||
      achievement.requirement ||
      "Complete this achievement to unlock the badge."
    );
  }

  function isUnlocked(
    achievement: Achievement
  ) {
    return Boolean(
      achievement.unlocked ||
        achievement.isUnlocked ||
        achievement.completed
    );
  }

  function getProgress(
    achievement: Achievement
  ) {
    const progress =
      Number(
        achievement.progress
      ) || 0;

    const target =
      Number(
        achievement.target
      ) || 0;

    if (target <= 0) {
      return isUnlocked(
        achievement
      )
        ? 100
        : 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (progress / target) * 100
      )
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="fixed inset-y-0 left-0 z-[60] w-[280px]">
        <Sidebar />
      </aside>

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="fixed left-[280px] right-0 top-0 z-[50] h-[68px]">
        <Navbar />
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="ml-[280px] min-h-screen pt-[68px]">

        <div className="p-8">

          <div className="mx-auto max-w-7xl">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-8 flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-orange-500/20">

                <Trophy
                  size={28}
                  className="text-white"
                />

              </div>

              <div>

                <h1 className="text-4xl font-black text-white">
                  Achievements
                </h1>

                <p className="mt-1 text-gray-400">
                  Complete challenges and earn badges.
                </p>

              </div>

            </div>

            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (
              <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                  <Loader2
                    size={42}
                    className="mx-auto mb-4 animate-spin text-cyan-400"
                  />

                  <p className="font-semibold text-gray-300">
                    Loading achievements...
                  </p>

                </div>

              </div>
            )}

            {/* ==================================================
                ERROR
            ================================================== */}

            {!loading && error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">

                <p className="font-bold text-red-400">
                  {error}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Check that your backend server is running.
                </p>

              </div>
            )}

            {/* ==================================================
                EMPTY
            ================================================== */}

            {!loading &&
              !error &&
              achievements.length === 0 && (

                <div className="rounded-3xl border border-white/10 bg-slate-900 p-12 text-center">

                  <Award
                    size={64}
                    className="mx-auto mb-5 text-gray-600"
                  />

                  <h2 className="text-2xl font-bold text-white">
                    No achievements yet
                  </h2>

                  <p className="mt-2 text-gray-500">
                    Achievements will appear here when they are available.
                  </p>

                </div>

              )}

            {/* ==================================================
                ACHIEVEMENT GRID
            ================================================== */}

            {!loading &&
              !error &&
              achievements.length > 0 && (

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                  {achievements.map(
                    (
                      achievement
                    ) => {

                      const unlocked =
                        isUnlocked(
                          achievement
                        );

                      const progress =
                        getProgress(
                          achievement
                        );

                      return (

                        <div
                          key={
                            achievement._id
                          }
                          className={`relative overflow-hidden rounded-3xl border p-6 transition ${
                            unlocked
                              ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-slate-900 to-slate-900"
                              : "border-white/10 bg-slate-900"
                          }`}
                        >

                          {/* TOP ICON */}

                          <div className="flex items-start justify-between">

                            <div
                              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                                unlocked
                                  ? "bg-yellow-500/20"
                                  : "bg-slate-800"
                              }`}
                            >

                              {unlocked ? (

                                <Trophy
                                  size={30}
                                  className="text-yellow-400"
                                />

                              ) : (

                                <Lock
                                  size={28}
                                  className="text-gray-500"
                                />

                              )}

                            </div>

                            {/* STATUS */}

                            {unlocked && (

                              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">

                                <CheckCircle
                                  size={13}
                                />

                                Unlocked

                              </div>

                            )}

                          </div>

                          {/* TITLE */}

                          <h2 className="mt-6 text-xl font-black text-white">

                            {getTitle(
                              achievement
                            )}

                          </h2>

                          {/* DESCRIPTION */}

                          <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-400">

                            {getDescription(
                              achievement
                            )}

                          </p>

                          {/* CATEGORY */}

                          {achievement.category && (

                            <div className="mt-4">

                              <span className="rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-400">

                                {
                                  achievement.category
                                }

                              </span>

                            </div>

                          )}

                          {/* POINTS */}

                          {typeof achievement.points ===
                            "number" && (

                            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-yellow-400">

                              <Star
                                size={16}
                                fill="currentColor"
                              />

                              {achievement.points} points

                            </div>

                          )}

                          {/* PROGRESS */}

                          {!unlocked &&
                            progress > 0 && (

                              <div className="mt-6">

                                <div className="mb-2 flex items-center justify-between text-xs">

                                  <span className="text-gray-500">
                                    Progress
                                  </span>

                                  <span className="font-bold text-cyan-400">
                                    {Math.round(
                                      progress
                                    )}
                                    %
                                  </span>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                                  <div
                                    className="h-full rounded-full bg-cyan-500 transition-all"
                                    style={{
                                      width: `${progress}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            )}

                          {/* UNLOCKED FOOTER */}

                          {unlocked && (

                            <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">

                              <CheckCircle
                                size={15}
                              />

                              Achievement completed

                            </div>

                          )}

                        </div>

                      );
                    }
                  )}

                </div>

              )}

          </div>

        </div>

      </main>

    </div>
  );
}
