"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

import WelcomeCard from "@/components/dashboard/cards/WelcomeCard";
import HeroCard from "@/components/dashboard/cards/HeroCard";
import StatsCard from "@/components/dashboard/cards/StatsCard";

import DashboardAnimations, {
  dashboardItemVariants,
} from "@/components/animation/DashboardAnimations";

import {
  Flame,
  MessageCircle,
  Trophy,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
          <DashboardAnimations>
            <div className="mx-auto max-w-7xl space-y-8">
              <motion.div variants={dashboardItemVariants}>
                <WelcomeCard />
              </motion.div>

              <motion.div variants={dashboardItemVariants}>
                <HeroCard />
              </motion.div>

              <motion.section
                variants={dashboardItemVariants}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
              >
                <StatsCard
                  title="Streak"
                  value={14}
                  subtitle="Days Active"
                  icon={
                    <Flame
                      size={40}
                      className="text-orange-400"
                    />
                  }
                  color="text-orange-400"
                />

                <StatsCard
                  title="Chats"
                  value={52}
                  subtitle="Total Conversations"
                  icon={
                    <MessageCircle
                      size={40}
                      className="text-cyan-400"
                    />
                  }
                  color="text-cyan-400"
                />

                <StatsCard
                  title="Friends"
                  value={8}
                  subtitle="Anonymous Partners"
                  icon={
                    <Users
                      size={40}
                      className="text-violet-400"
                    />
                  }
                  color="text-violet-400"
                />

                <StatsCard
                  title="Achievements"
                  value={12}
                  subtitle="Unlocked Badges"
                  icon={
                    <Trophy
                      size={40}
                      className="text-yellow-400"
                    />
                  }
                  color="text-yellow-400"
                />
              </motion.section>
            </div>
          </DashboardAnimations>
        </main>
      </div>
    </div>
  );
}