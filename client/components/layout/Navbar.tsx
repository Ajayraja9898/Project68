"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  User,
  LogOut,
  Settings,
} from "lucide-react";

interface UserData {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
  };
}

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    function loadUser() {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          setUser(null);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("NAVBAR USER LOAD ERROR:", error);
        setUser(null);
      }
    }

    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const actualUser = user?.user || user;

  const displayName =
    actualUser?.name ||
    actualUser?.username ||
    actualUser?.email?.split("@")[0] ||
    "Student";

  const displayRole = actualUser?.role || "Student";

  const avatarLetter =
    displayName.charAt(0).toUpperCase();

  function handleNotificationClick() {
    setOpenProfile(false);
    window.location.href = "/notifications";
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setOpenProfile(false);

    window.location.href = "/login";
  }

  function handleProfileClick() {
    setOpenProfile(false);
    window.location.href = "/profile";
  }

  function handleSettingsClick() {
    setOpenProfile(false);
    window.location.href = "/settings";
  }

  return (
    <header className="relative z-[100] flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[#0b1224] px-4 md:px-6">

      {/* LEFT SECTION */}

      <div className="flex items-center gap-4">

        {/* Mobile Menu */}

        <button
          type="button"
          className="rounded-xl p-2 text-gray-300 transition hover:bg-white/10 md:hidden"
        >
          <Menu size={22} />
        </button>

        {/* Search */}

        <div className="relative hidden md:block">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search students, chats..."
            className="w-80 rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition-all placeholder:text-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </div>

      {/* RIGHT SECTION */}

      <div className="flex items-center gap-3">

        {/* NOTIFICATION BUTTON */}

        <button
          type="button"
          onClick={handleNotificationClick}
          className="relative rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-violet-500 hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell
            size={20}
            className="text-white"
          />

          <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* PROFILE */}

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setOpenProfile((previous) => !previous)
            }
            className="relative z-[110] flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition hover:border-violet-500 hover:bg-white/10"
          >

            {/* Avatar */}

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white shadow-lg">
              {avatarLetter}
            </div>

            {/* Name */}

            <div className="hidden text-left lg:block">
              <p className="font-semibold text-white">
                {displayName}
              </p>

              <p className="text-sm capitalize text-gray-400">
                {displayRole}
              </p>
            </div>

            {/* Arrow */}

            <ChevronDown
              size={18}
              className={`hidden text-gray-400 transition-transform lg:block ${
                openProfile ? "rotate-180" : ""
              }`}
            />

          </button>

          {/* PROFILE DROPDOWN */}

          {openProfile && (
            <div className="absolute right-0 top-[58px] z-[200] w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#111a30] shadow-2xl">

              {/* User information */}

              <div className="border-b border-white/10 px-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white">
                    {avatarLetter}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-semibold text-white">
                      {displayName}
                    </p>

                    <p className="truncate text-xs text-gray-400">
                      {actualUser?.email || ""}
                    </p>

                  </div>

                </div>

              </div>

              {/* Profile */}

              <button
                type="button"
                onClick={handleProfileClick}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <User size={18} />
                <span>Profile</span>
              </button>

              {/* Settings */}

              <button
                type="button"
                onClick={handleSettingsClick}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>

              {/* Logout */}

              <div className="border-t border-white/10">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}