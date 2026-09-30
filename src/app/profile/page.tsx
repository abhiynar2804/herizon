"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "PARTNER" | "ADMIN";
  isActive: boolean;
  emailVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
  healthProfile?: {
    id: string;
    bloodGroup: string | null;
    heightCm: number;
    weightKg: number;
    averageCycleLength: number | null;
    averagePeriodLength: number | null;
  } | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit Profile State
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/profile");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile.");
      }

      setProfile(data.user);
      setName(data.user.name || "");
      setAvatarUrl(data.user.avatarUrl || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          avatarUrl: avatarUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setSuccess("Profile updated successfully.");
      setProfile((prev) => (prev ? { ...prev, ...data.user } : prev));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError("");
      setPasswordSuccess("");

      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar userName={profile?.name} userEmail={profile?.email} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/70 text-pink-700 text-xs font-semibold">
            ⚙️ Account &amp; Security Settings
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            User Profile
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your personal identity, login security, and linked wellness preferences.
          </p>
        </header>

        {loading ? (
          <div className="rounded-3xl bg-white p-12 text-center text-xs text-gray-500 shadow-xs border border-pink-100/60">
            Loading your profile details...
          </div>
        ) : profile ? (
          <div className="space-y-8">
            {/* Profile Overview Header Card */}
            <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-pink-200 shadow-md"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-pink-500/20">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      {profile.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-100 text-[10px] font-bold">
                      {profile.role}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        profile.emailVerified
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {profile.emailVerified ? "Verified Email" : "Standard Account"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{profile.email}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Member since {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <Link
                href="/onboarding"
                className="px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold border border-pink-200 transition"
              >
                📋 Edit Health Vitals →
              </Link>
            </section>

            {/* Profile Update Form */}
            <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 space-y-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Personal Information
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your display name and avatar icon.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                  ✓ {success}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div>
                  <label
                    htmlFor="profileName"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Display Name *
                  </label>
                  <input
                    id="profileName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profileEmail"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="profileEmail"
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Email address is tied to authentication and cannot be altered here.
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="avatarUrl"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Avatar Image URL (Optional)
                  </label>
                  <input
                    id="avatarUrl"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition"
                >
                  {savingProfile ? "Saving Profile..." : "Save Profile Details"}
                </button>
              </form>
            </section>

            {/* Change Password Form */}
            <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 space-y-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Security &amp; Password
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Change your password to keep your reproductive health data private.
                </p>
              </div>

              {passwordError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                  ✓ {passwordSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Current Password *
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-semibold text-gray-700 mb-1.5"
                    >
                      New Password *
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold text-gray-700 mb-1.5"
                    >
                      Confirm New Password *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition"
                >
                  {savingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </section>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
