"use client";

import { useState } from "react";
import {
  Bell,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Shield,
  UserRound,
  Users,
} from "lucide-react";

import { API_URL } from "@/lib/api";

export default function SettingsPage() {
  const [partnerAvailable, setPartnerAvailable] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        `${API_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to change password"
        );
      }

      setPasswordMessage(
        data.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Unable to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/";
    }
  };
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-2 text-slate-400">
            Manage your Project68 account and preferences.
          </p>
        </div>

        <div className="space-y-4">

          {/* Account */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <UserRound className="text-cyan-400" />

              <div>
                <h2 className="font-semibold">Account</h2>
                <p className="text-sm text-slate-400">
                  Manage your account information.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.href = "/profile";
              }}
              className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
            >
              View Profile
            </button>
          </section>

          {/* Change Password */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <KeyRound className="text-cyan-400" />

              <div>
                <h2 className="font-semibold">
                  Change Password
                </h2>

                <p className="text-sm text-slate-400">
                  Update your Project68 account password.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="mt-5 space-y-4"
            >
              {/* Current Password */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Current Password
                </label>

                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-white outline-none focus:border-cyan-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrent(!showCurrent)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrent ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-white outline-none focus:border-cyan-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNew ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirm ? "text" : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-white outline-none focus:border-cyan-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(!showConfirm)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirm ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {passwordError && (
                <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                  {passwordError}
                </div>
              )}

              {/* Success */}
              {passwordMessage && (
                <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
                  {passwordMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-lg bg-cyan-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {changingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </form>
          </section>

          {/* Notifications */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <Bell className="text-cyan-400" />

              <div>
                <h2 className="font-semibold">
                  Notifications
                </h2>

                <p className="text-sm text-slate-400">
                  Control notification preferences.
                </p>
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-center justify-between">
              <span className="text-sm">
                Enable notifications
              </span>

              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) =>
                  setNotifications(e.target.checked)
                }
                className="h-5 w-5"
              />
            </label>
          </section>

          {/* Partner Matching */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <Users className="text-cyan-400" />

              <div>
                <h2 className="font-semibold">
                  Partner Matching
                </h2>

                <p className="text-sm text-slate-400">
                  Choose whether you appear as an available
                  anonymous partner.
                </p>
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-center justify-between">
              <span className="text-sm">
                Available for partner matching
              </span>

              <input
                type="checkbox"
                checked={partnerAvailable}
                onChange={(e) =>
                  setPartnerAvailable(e.target.checked)
                }
                className="h-5 w-5"
              />
            </label>
          </section>

          {/* Security */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <Shield className="text-cyan-400" />

              <div>
                <h2 className="font-semibold">
                  Security
                </h2>

                <p className="text-sm text-slate-400">
                  Keep your Project68 account secure.
                </p>
              </div>
            </div>
          </section>

          {/* Logout */}
          <section className="rounded-2xl border border-red-900/40 bg-red-950/20 p-5">
            <div className="flex items-center gap-3">
              <LogOut className="text-red-400" />

              <div>
                <h2 className="font-semibold">Logout</h2>

                <p className="text-sm text-slate-400">
                  Sign out of your Project68 account.
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500"
            >
              <LogOut size={16} />
              Logout
            </button>
          </section>

        </div>
      </div>
    </main>
  );
}