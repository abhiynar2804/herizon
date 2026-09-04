"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PendingInviteCardProps {
  inviterName: string;
  inviterEmail: string;
  inviteToken: string;
  invitedAt: string | Date;
}

export default function PendingInviteCard({
  inviterName,
  inviterEmail,
  inviteToken,
  invitedAt,
}: PendingInviteCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  async function handleAccept() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/partner/invite/${inviteToken}/accept`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept invitation.");
      }

      setAccepted(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      setLoading(false);
    }
  }

  const formattedDate = new Date(invitedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl bg-white p-6 sm:p-8 shadow-xl shadow-pink-900/5 border border-pink-100 text-center space-y-6">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-3xl flex items-center justify-center mx-auto shadow-md shadow-pink-500/20 animate-pulse">
        ❤️
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/70 text-pink-800 text-xs font-semibold">
          Pending Invitation Received
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
          Connect with {inviterName}
        </h1>
        <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
          <strong className="text-gray-900">{inviterName}</strong> ({inviterEmail}) has invited you as a partner to receive shared cycle phase insights, support tips, and wellness updates.
        </p>
        <p className="text-[11px] text-gray-400">Received on {formattedDate}</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {accepted ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold space-y-1">
          <p>✓ Invitation Accepted!</p>
          <p className="text-[11px] text-emerald-600">
            Loading your shared partner dashboard...
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleAccept}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Accepting Invitation...</span>
              </>
            ) : (
              <>
                <span>Accept Partner Invitation</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
