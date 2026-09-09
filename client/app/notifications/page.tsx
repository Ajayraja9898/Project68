"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

import {
  Mail,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  getPendingInvites,
  acceptInvite,
  declineInvite,
} from "@/services/inviteService";

export default function NotificationsPage() {
  const router = useRouter();

  const [invites, setInvites] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [processingId, setProcessingId] =
    useState("");

  // ======================================================
  // LOAD INVITES
  // ======================================================

  async function loadInvites() {
    try {
      setLoading(true);
      setMessage("");

      const data =
        await getPendingInvites();

      if (data?.success) {
        setInvites(
          Array.isArray(data.invites)
            ? data.invites
            : []
        );
      } else {
        setInvites([]);

        setMessage(
          data?.message ||
            "Unable to load invitations."
        );
      }
    } catch (error) {
      console.error(
        "LOAD INVITES ERROR:",
        error
      );

      setInvites([]);

      setMessage(
        "Unable to load invitations."
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadInvites();
  }, []);

  // ======================================================
  // ACCEPT INVITE
  // ======================================================

  async function handleAccept(
    inviteId: string
  ) {
    try {
      setProcessingId(inviteId);
      setMessage("");

      const data =
        await acceptInvite(
          inviteId
        );

      if (!data?.success) {
        setMessage(
          data?.message ||
            "Unable to accept invitation."
        );

        return;
      }

      const chatId =
        data?.chatId;

      if (!chatId) {
        setMessage(
          "Invitation accepted, but chat ID was not returned."
        );

        await loadInvites();

        return;
      }

      // Remove accepted invitation.
      setInvites((previous) =>
        previous.filter(
          (invite) =>
            String(invite._id) !==
            String(inviteId)
        )
      );

      // Open the private chat immediately.
      router.push(
        `/chat/${chatId}`
      );
    } catch (error) {
      console.error(
        "ACCEPT INVITE ERROR:",
        error
      );

      setMessage(
        "Unable to accept invitation."
      );
    } finally {
      setProcessingId("");
    }
  }

  // ======================================================
  // DECLINE INVITE
  // ======================================================

  async function handleDecline(
    inviteId: string
  ) {
    try {
      setProcessingId(inviteId);
      setMessage("");

      const data =
        await declineInvite(
          inviteId
        );

      if (!data?.success) {
        setMessage(
          data?.message ||
            "Unable to decline invitation."
        );

        return;
      }

      setInvites((previous) =>
        previous.filter(
          (invite) =>
            String(invite._id) !==
            String(inviteId)
        )
      );

      setMessage(
        "Anonymous invitation declined."
      );
    } catch (error) {
      console.error(
        "DECLINE INVITE ERROR:",
        error
      );

      setMessage(
        "Unable to decline invitation."
      );
    } finally {
      setProcessingId("");
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar />

      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Connections
              </p>

              <h1 className="mt-2 text-4xl font-black text-white">
                Anonymous Invitations
              </h1>

              <p className="mt-3 text-gray-400">
                Invitations reveal no real name or roll
                number. Accept to begin an anonymous
                private conversation.
              </p>
            </div>

            {/* ==================================================
                STATUS MESSAGE
            ================================================== */}

            {message && (
              <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-300">
                {message}
              </div>
            )}

            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (
              <div className="rounded-3xl bg-slate-900 p-10 text-center">
                <p className="text-cyan-400">
                  Loading invitations...
                </p>
              </div>
            )}

            {/* ==================================================
                EMPTY
            ================================================== */}

            {!loading &&
              invites.length === 0 && (
                <div className="rounded-3xl border border-white/5 bg-slate-900 p-10 text-center">
                  <Mail
                    size={60}
                    className="mx-auto mb-5 text-gray-600"
                  />

                  <h2 className="text-2xl font-bold text-white">
                    No Pending Invitations
                  </h2>

                  <p className="mt-3 text-gray-400">
                    You don't have any anonymous
                    connection requests right now.
                  </p>
                </div>
              )}

            {/* ==================================================
                INVITATIONS
            ================================================== */}

            {!loading &&
              invites.length > 0 && (
                <div className="space-y-5">

                  {invites.map(
                    (invite) => {
                      const inviteId =
                        String(
                          invite._id
                        );

                      const processing =
                        processingId ===
                        inviteId;

                      return (
                        <div
                          key={inviteId}
                          className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl"
                        >
                          <div className="flex items-start gap-5">

                            {/* Anonymous Avatar */}

                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-2xl font-black text-white">
                              ?
                            </div>

                            {/* Invitation Content */}

                            <div className="min-w-0 flex-1">
                              <h2 className="text-xl font-bold text-white">
                                Anonymous Invitation
                              </h2>

                              <p className="mt-2 text-gray-300">
                                Someone wants to
                                connect with you
                                anonymously.
                              </p>

                              <p className="mt-2 text-sm text-gray-500">
                                Their real identity
                                and roll number are
                                hidden.
                              </p>

                              {invite.createdAt && (
                                <p className="mt-3 text-xs text-gray-600">
                                  Invitation received
                                  {" "}
                                  {new Date(
                                    invite.createdAt
                                  ).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* ==================================================
                              ACTIONS
                          ================================================== */}

                          <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                            <button
                              type="button"
                              onClick={() =>
                                handleAccept(
                                  inviteId
                                )
                              }
                              disabled={
                                processing
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CheckCircle
                                size={20}
                              />

                              {processing
                                ? "Processing..."
                                : "Accept"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDecline(
                                  inviteId
                                )
                              }
                              disabled={
                                processing
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <XCircle
                                size={20}
                              />

                              {processing
                                ? "Processing..."
                                : "Decline"}
                            </button>

                          </div>
                        </div>
                      );
                    }
                  )}

                </div>
              )}

          </div>
        </main>
      </div>
    </div>
  );
}