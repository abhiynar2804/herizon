"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "true";
  const errorParam = searchParams.get("error");

  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendStatus("loading");
    setResendMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setResendStatus("sent");
        setResendMessage("Verification link sent! Check your inbox.");
      } else {
        setResendStatus("error");
        setResendMessage(data.message || "Failed to resend verification link.");
      }
    } catch {
      setResendStatus("error");
      setResendMessage("Network error. Please try again.");
    }
  };

  return (
    <AuthLayout
      activeTab="login"
      title="Email Verification"
      subtitle="Secure and authenticate your Herizon account"
    >
      <div className="space-y-6 text-center">
        {verified ? (
          <div className="space-y-4 py-4">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl shadow-xs">
              ✨
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Email Successfully Verified!
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Your account has been confirmed. You now have full access to all Herizon reproductive health features.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-sm font-semibold shadow-xs transition"
            >
              Sign In to Continue →
            </Link>
          </div>
        ) : errorParam ? (
          <div className="space-y-4 py-4">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center text-3xl shadow-xs">
              ⚠️
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {errorParam === "expired"
                  ? "Verification Link Expired"
                  : "Invalid Verification Link"}
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                {errorParam === "expired"
                  ? "The link you clicked has expired (valid for 24 hours). Please request a new verification link below."
                  : "We could not verify your email with the provided link. Please request a new link below."}
              </p>
            </div>

            <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Account Email
                </label>
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500"
                />
              </div>

              {resendMessage && (
                <p
                  className={`text-xs ${
                    resendStatus === "sent" ? "text-emerald-600 font-semibold" : "text-red-500"
                  }`}
                >
                  {resendMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={resendStatus === "loading"}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {resendStatus === "loading" ? "Sending..." : "Resend Verification Link"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-pink-50 text-pink-600 flex items-center justify-center text-3xl shadow-xs">
              📩
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Check Your Inbox
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                We sent a verification link to your email address. Click the link to activate your account.
              </p>
            </div>

            <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Didn&apos;t receive it? Enter email to resend:
                </label>
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500"
                />
              </div>

              {resendMessage && (
                <p
                  className={`text-xs ${
                    resendStatus === "sent" ? "text-emerald-600 font-semibold" : "text-red-500"
                  }`}
                >
                  {resendMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={resendStatus === "loading"}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {resendStatus === "loading" ? "Sending..." : "Resend Link"}
              </button>
            </form>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <Link
            href="/login"
            className="text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-rose-50/50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-600"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
