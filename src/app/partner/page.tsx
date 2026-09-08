"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type PartnerInfo = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type ConnectionInfo = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "DISCONNECTED";
  invitedAt: string;
  acceptedAt?: string | null;
  disconnectedAt?: string | null;
  inviteToken?: string;
};

type SharingSetting = {
  id: string;
  connectionId: string;
  shareCyclePhase: boolean;
  shareNextPeriod: boolean;
  shareMood: boolean;
  shareCareSuggestions: boolean;
  shareReminders: boolean;
};

export default function PartnerManagementPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [connected, setConnected] = useState(false);
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [sharing, setSharing] = useState<SharingSetting | null>(null);

  // Invite input
  const [inviteEmail, setInviteEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchConnection();
  }, []);

  async function fetchConnection() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/partner/connection");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load partner connection.");
      }

      setConnected(data.connected);
      setConnection(data.connection);
      setPartner(data.partner);
      setSharing(data.sharingSetting);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load connection data."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/partner/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send invitation.");
      }

      setSuccess("Partner invitation sent successfully!");
      setInviteEmail("");
      await fetchConnection();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send invitation."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleSharing(key: keyof Omit<SharingSetting, "id" | "connectionId">) {
    if (!sharing) return;

    const updated = {
      ...sharing,
      [key]: !sharing[key],
    };

    // Optimistic update
    setSharing(updated);

    try {
      const response = await fetch("/api/partner/sharing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shareCyclePhase: updated.shareCyclePhase,
          shareNextPeriod: updated.shareNextPeriod,
          shareMood: updated.shareMood,
          shareCareSuggestions: updated.shareCareSuggestions,
          shareReminders: updated.shareReminders,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update sharing settings.");
      }
    } catch (err) {
      // Revert on error
      setError(err instanceof Error ? err.message : "Failed to save setting.");
      await fetchConnection();
    }
  }

  async function handleDisconnect() {
    if (
      !confirm(
        "Are you sure you want to disconnect your partner? They will immediately lose access to all shared cycle updates."
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/partner/connection/disconnect", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to disconnect partner.");
      }

      setSuccess("Partner connection disconnected.");
      await fetchConnection();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect partner."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/70 text-pink-700 text-xs font-semibold">
            ❤️ Partner Sharing &amp; Privacy Sync
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Partner Access Hub
          </h1>
          <p className="text-gray-500 text-sm">
            Invite one trusted partner to receive updates on your cycle phase and care tips with total privacy control.
          </p>
        </header>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
            ✓ {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-12 text-center text-xs text-gray-500 border border-pink-100/60 shadow-xs">
            Loading partner connection details...
          </div>
        ) : connected && partner && sharing ? (
          /* STATUS 1: ACTIVE CONNECTED PARTNER */
          <div className="space-y-6">
            {/* Active Connection Banner Card */}
            <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-pink-500/20">
                  {partner.name[0]?.toUpperCase() || "P"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900">
                      {partner.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      ● Connected &amp; Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{partner.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDisconnect}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition border border-red-100"
              >
                {submitting ? "Disconnecting..." : "Disconnect Partner"}
              </button>
            </section>

            {/* Granular Privacy Toggles Card */}
            <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 space-y-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Granular Sharing &amp; Privacy Settings
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Choose exactly what information {partner.name} can view on their Partner Dashboard.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Toggle 1: Cycle Phase */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      🌸 Share Cycle Phase
                    </span>
                    <span className="text-xs text-gray-500">
                      Allows partner to see your current phase (Menstrual, Follicular, Ovulation, Luteal).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSharing("shareCyclePhase")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      sharing.shareCyclePhase ? "bg-pink-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        sharing.shareCyclePhase ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Next Period Date */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      📅 Share Next Predicted Period Date
                    </span>
                    <span className="text-xs text-gray-500">
                      Allows partner to view countdown for your upcoming period so they can support you.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSharing("shareNextPeriod")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      sharing.shareNextPeriod ? "bg-pink-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        sharing.shareNextPeriod ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3: Mood */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      😊 Share Logged Mood &amp; Sensations
                    </span>
                    <span className="text-xs text-gray-500">
                      Shows daily feelings or sensations logged in your period tracker.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSharing("shareMood")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      sharing.shareMood ? "bg-pink-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        sharing.shareMood ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 4: Care Suggestions */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      💡 Share Care &amp; Support Suggestions
                    </span>
                    <span className="text-xs text-gray-500">
                      Provides partner with practical supportive actions (e.g. heating pads, herbal teas, quiet rest).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSharing("shareCareSuggestions")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      sharing.shareCareSuggestions ? "bg-pink-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        sharing.shareCareSuggestions ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 5: Reminders */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      🔔 Share Care Reminders
                    </span>
                    <span className="text-xs text-gray-500">
                      Notifies partner of key supportive check-in milestones.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSharing("shareReminders")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      sharing.shareReminders ? "bg-pink-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        sharing.shareReminders ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : connection && connection.status === "PENDING" && partner ? (
          /* STATUS 2: PENDING INVITATION */
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 text-xl">
                  ⏳
                </span>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Partner Invitation Pending
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Invitation sent to <span className="font-semibold text-gray-800">{partner.email}</span>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900 space-y-2">
                <p className="font-semibold">What happens next?</p>
                <p className="leading-relaxed">
                  Your partner needs to sign into Herizon with their partner account and accept the invitation to complete the sync.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition"
                >
                  Cancel Invitation
                </button>
              </div>
            </section>
          </div>
        ) : (
          /* STATUS 3: UNCONNECTED - INVITE FORM */
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Connect Your Partner
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-lg">
                Invite your partner to receive an exclusive, privacy-focused dashboard. You remain in 100% control of what data is shared.
              </p>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 max-w-md">
              <div>
                <label
                  htmlFor="inviteEmail"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Partner Email Address *
                </label>
                <input
                  id="inviteEmail"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="partner@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Note: Partner must be registered on Herizon with a Partner role account.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !inviteEmail.trim()}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold text-sm shadow-xs disabled:opacity-50 transition active:scale-[0.99]"
              >
                {submitting ? "Sending Invitation..." : "Send Partner Invitation"}
              </button>
            </form>

            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100/60">
                <span className="font-bold text-pink-900 block mb-0.5">🔒 What stays private?</span>
                <p className="text-gray-500 leading-relaxed text-[11px]">
                  Your health profile, detailed symptoms, private notes, and AI conversations are NEVER shared.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/60">
                <span className="font-bold text-purple-900 block mb-0.5">❤️ What can be shared?</span>
                <p className="text-gray-500 leading-relaxed text-[11px]">
                  Only cycle phase, predicted period timeframe, mood, and supportive care suggestions.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
