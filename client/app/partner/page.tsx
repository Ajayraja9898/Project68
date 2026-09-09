"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

import {
  getAvailablePartners,
  sendPartnerInvite,
} from "@/services/partnerService";

import {
  searchStudent,
  sendInvite,
} from "@/services/inviteService";

interface Partner {
  id: string;
  anonymousName: string;
  avatar: string;
  department: string;
  year: number;
  isOnline: boolean;
}

interface SearchResult {
  id: string;
  department?: string;
  year?: number;
  avatar?: string;
}

export default function PartnerPage() {
  const router = useRouter();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchRollNumber, setSearchRollNumber] =
    useState("");

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchResult, setSearchResult] =
    useState<SearchResult | null>(null);

  const [searchMessage, setSearchMessage] =
    useState("");

  const [connectingId, setConnectingId] =
    useState("");

  const [message, setMessage] =
    useState("");

  // ======================================================
  // LOAD AVAILABLE PARTNERS
  // ======================================================

  const loadPartners = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data =
        await getAvailablePartners();

      if (data.success) {
        setPartners(
          Array.isArray(data.partners)
            ? data.partners
            : []
        );
      } else {
        setPartners([]);
        setMessage(
          data.message ||
            "Unable to find available partners."
        );
      }
    } catch (error) {
      console.error(
        "PARTNER LOAD ERROR:",
        error
      );

      setMessage(
        "Unable to load available partners."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  // ======================================================
  // SEARCH BY ROLL NUMBER
  // ======================================================

  async function handleSearch() {
    const value =
      searchRollNumber.trim();

    if (!value) {
      setSearchMessage(
        "Enter a Roll Number."
      );
      setSearchResult(null);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchMessage("");
      setSearchResult(null);

      const data =
        await searchStudent(value);

      if (!data.success) {
        setSearchMessage(
          data.message ||
            "Student not found."
        );

        return;
      }

      setSearchResult(
        data.student || null
      );

      setSearchMessage(
        "Student found. Their identity remains anonymous."
      );
    } catch (error) {
      console.error(
        "SEARCH ERROR:",
        error
      );

      setSearchMessage(
        "Unable to search for that student."
      );
    } finally {
      setSearchLoading(false);
    }
  }

  // ======================================================
  // SEND ROLL-NUMBER INVITE
  // ======================================================

  async function handleSearchInvite() {
    const value =
      searchRollNumber.trim();

    if (!value) {
      return;
    }

    try {
      setConnectingId(
        searchResult?.id || "search"
      );

      const data =
        await sendInvite(value);

      setSearchMessage(
        data.message ||
          "Anonymous invitation sent."
      );

      if (data.success) {
        setSearchResult(null);
        setSearchRollNumber("");
      }
    } catch (error) {
      console.error(
        "SEARCH INVITE ERROR:",
        error
      );

      setSearchMessage(
        "Unable to send invitation."
      );
    } finally {
      setConnectingId("");
    }
  }

  // ======================================================
  // CONNECT TO RANDOM AVAILABLE PARTNER
  // ======================================================

  async function handleConnect(
    partner: Partner
  ) {
    try {
      setConnectingId(partner.id);
      setMessage("");
  
      const data =
        await sendPartnerInvite(
          partner.id
        );
  
      if (data.success) {
        setMessage(
          "Anonymous invitation sent successfully."
        );
  
        setPartners((previous) =>
          previous.filter(
            (item) =>
              item.id !== partner.id
          )
        );
      } else {
        setMessage(
          data.message ||
            "Unable to send invitation."
        );
      }
    } catch (error) {
      console.error(
        "CONNECT ERROR:",
        error
      );
  
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to send invitation."
      );
    } finally {
      setConnectingId("");
    }
  }
  
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-6xl">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
                Anonymous Connections
              </p>

              <h1 className="mt-2 text-4xl font-black text-white">
                Find a New Partner
              </h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Find another student without revealing
                real identities. Your conversation remains
                anonymous.
              </p>
            </div>

            {/* ==================================================
                SEARCH BY ROLL NUMBER
            ================================================== */}

            <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white">
                Search by Roll Number
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                The roll number is used only to locate
                the account. The other student will not
                see your roll number.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  value={searchRollNumber}
                  onChange={(event) =>
                    setSearchRollNumber(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      handleSearch();
                    }
                  }}
                  placeholder="Enter Roll Number"
                  className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-violet-500"
                />

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                >
                  {searchLoading
                    ? "Searching..."
                    : "Search"}
                </button>
              </div>

              {searchMessage && (
                <p className="mt-4 text-sm text-cyan-300">
                  {searchMessage}
                </p>
              )}

              {searchResult && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-xl font-bold text-white">
                      ?
                    </div>

                    <div>
                      <h3 className="font-bold text-white">
                        Anonymous Student
                      </h3>

                      <p className="text-sm text-gray-400">
                        {searchResult.department ||
                          "Computer Science"}
                      </p>

                      <p className="text-sm text-gray-500">
                        Year{" "}
                        {searchResult.year ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleSearchInvite
                    }
                    disabled={
                      Boolean(connectingId)
                    }
                    className="mt-5 w-full rounded-xl bg-cyan-600 py-3 font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
                  >
                    {connectingId
                      ? "Sending..."
                      : "Send Anonymous Invite"}
                  </button>
                </div>
              )}
            </section>

            {/* ==================================================
                RANDOM AVAILABLE PARTNERS
            ================================================== */}

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Online & Available
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Students available for a new
                    anonymous connection.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadPartners}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
                >
                  ↻ Refresh
                </button>
              </div>

              {message && (
                <div className="mb-5 rounded-xl bg-red-500/10 p-4 text-red-300">
                  {message}
                </div>
              )}

              {loading && (
                <p className="text-cyan-400">
                  Finding available partners...
                </p>
              )}

              {!loading &&
                partners.length === 0 && (
                  <div className="rounded-3xl bg-slate-900 p-10 text-center">
                    <div className="text-5xl">
                      🕵️
                    </div>

                    <h3 className="mt-4 text-xl font-bold text-white">
                      Nobody is available right now
                    </h3>

                    <p className="mt-2 text-gray-400">
                      Try again later or search for
                      a student by roll number.
                    </p>
                  </div>
                )}

              {!loading &&
                partners.length > 0 && (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                    {partners.map(
                      (partner) => (
                        <div
                          key={partner.id}
                          className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-xl font-bold">
                              ?
                            </div>

                            <div>
                              <h3 className="font-bold text-white">
                                Anonymous Partner
                              </h3>

                              <p className="text-sm text-green-400">
                                ● Online
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 text-sm text-gray-400">
                            <p>
                              {partner.department ||
                                "Computer Science"}
                            </p>

                            <p>
                              Year{" "}
                              {partner.year ||
                                "—"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleConnect(
                                partner
                              )
                            }
                            disabled={
                              Boolean(
                                connectingId
                              )
                            }
                            className="mt-6 w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                          >
                            {connectingId ===
                            partner.id
                              ? "Sending..."
                              : "Connect"}
                          </button>
                        </div>
                      )
                    )}

                  </div>
                )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}