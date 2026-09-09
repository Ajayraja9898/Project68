"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  Users,
  User,
  Shield,
  Settings,
  LogOut,
  IdCard,
  Trophy,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Anonymous Chat",
      href: "/chat",
      icon: MessageCircle,
    },
    {
      name: "Community",
      href: "/community",
      icon: Users,
    },
    {
      name: "Passport",
      href: "/passport",
      icon: IdCard,
    },
    {
      name: "Achievements",
      href: "/achievements",
      icon: Trophy,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "Admin",
      href: "/admin",
      icon: Shield,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  }

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-white/10 bg-slate-950/90 backdrop-blur-xl">

      {/* ==================================================
          LOGO
      ================================================== */}

      <div className="border-b border-white/10 p-8">
        <h1 className="text-3xl font-black tracking-wider text-violet-400">
          PROJECT68
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          A DeadSec Original
        </p>
      </div>

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <nav className="flex-1 space-y-2 overflow-y-auto p-5">

        {menu.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl px-4 py-4 transition-all duration-300 ${
                isActive
                  ? "bg-violet-600 text-white shadow-lg"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={22} />

              <span className="font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}

      </nav>

      {/* ==================================================
          LOGOUT
      ================================================== */}

      <div className="border-t border-white/10 p-5">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

    </aside>
  );
}