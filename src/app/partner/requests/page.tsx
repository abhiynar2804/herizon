"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type PartnerRequest = {
  id: string;
  inviteToken: string;
  invitedAt: string;
  inviter: {
    id: string;
    name: string;
    email: string;
  };
};

export default function PartnerRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingToken, setProcessingToken] = useState("");
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/partner/requests", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load requests.");
      }

      setRequests(data.requests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load partner requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function handleAccept(token: string) {
    try {
      setProcessingToken(token);
      setError("");

      const response = await fetch(`/api/partner/invite/${token}/accept`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept invitation.");
      }

      router.push("/partner/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept invitation.",
      );
      setProcessingToken("");
    }
  }

  async function handleDecline(token: string) {
    if (!confirm("Are you sure you want to decline this invitation?")) {
      return;
    }

    try {
      setProcessingToken(token);
      setError("");

      const response = await fetch(`/api/partner/invite/${token}/decline`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to decline invitation.");
      }

      setRequests((current) =>
        current.filter((request) => request.inviteToken !== token),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to decline invitation.",
      );
    } finally {
      setProcessingToken("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          <header>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/70 text-pink-700 text-xs font-semibold">
              💌 Partner Requests
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
              Your Partner Inbox
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Review invitations from people who want to connect with you on
              Herizon.
            </p>
          </header>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl bg-white border border-pink-100/60 p-10 text-center text-sm text-gray-500">
              Loading your partner requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-3xl bg-white border border-pink-100/60 p-10 text-center shadow-xs">
              <div className="text-4xl mb-3">💌</div>

              <h2 className="text-lg font-bold text-gray-900">
                No Pending Requests
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                When someone invites you to connect as their partner, the
                invitation will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const processing = processingToken === request.inviteToken;

                return (
                  <section
                    key={request.id}
                    className="rounded-3xl bg-white border border-pink-100/60 p-6 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-bold text-lg flex items-center justify-center">
                          {request.inviter.name?.[0]?.toUpperCase() || "P"}
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-gray-900">
                            {request.inviter.name}
                          </h2>

                          <p className="text-xs text-gray-500">
                            {request.inviter.email}
                          </p>

                          <p className="text-[11px] text-gray-400 mt-1">
                            Sent{" "}
                            {new Date(request.invitedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => handleDecline(request.inviteToken)}
                          className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition disabled:opacity-50"
                        >
                          Decline
                        </button>

                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => handleAccept(request.inviteToken)}
                          className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold transition disabled:opacity-50"
                        >
                          {processing ? "Processing..." : "Accept"}
                        </button>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
