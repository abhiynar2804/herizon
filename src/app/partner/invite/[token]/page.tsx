"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AcceptPartnerInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleAccept() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/partner/invite/${token}/accept`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept invitation.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/partner/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept invitation."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-6 sm:p-8 shadow-xl shadow-pink-900/5 border border-pink-100 text-center space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md shadow-pink-500/20">
            ❤️
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Partner Invitation
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              You have been invited to connect as a partner on Herizon.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold space-y-1">
              <p>✓ Invitation Accepted!</p>
              <p className="text-[11px] text-emerald-600">
                Redirecting to your Partner Shared Dashboard...
              </p>
            </div>
          ) : status === "loading" ? (
            <p className="text-xs text-gray-400">Checking your account session...</p>
          ) : !session ? (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-2xl border border-amber-100">
                Please sign in with your Partner account to accept this invitation.
              </p>
              <Link
                href="/login"
                className="block w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs transition"
              >
                Sign In to Accept
              </Link>
            </div>
          ) : session.user.role !== "PARTNER" ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
              You are currently logged in as a <strong>Primary User</strong>. To accept partner invitations, please log in with a <strong>Partner</strong> role account.
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAccept}
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold text-sm shadow-md shadow-pink-500/20 transition active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Accepting..." : "Accept Partner Invitation"}
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
