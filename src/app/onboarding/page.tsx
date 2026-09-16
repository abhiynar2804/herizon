"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type HealthProfileForm = {
  dateOfBirth: string;
  heightCm: string;
  weightKg: string;
  bloodGroup: string;
  allergies: string;
  medicalConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  lastPeriodDate: string;
  averageCycleLength: string;
  averagePeriodLength: string;
};

const initialForm: HealthProfileForm = {
  dateOfBirth: "",
  heightCm: "",
  weightKg: "",
  bloodGroup: "",
  allergies: "",
  medicalConditions: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  lastPeriodDate: "",
  averageCycleLength: "28",
  averagePeriodLength: "5",
};

function formatDateForInput(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
}

function getLatestAllowedBirthDate() {
  const latestAllowedBirthDate = new Date();
  latestAllowedBirthDate.setUTCHours(0, 0, 0, 0);
  latestAllowedBirthDate.setUTCFullYear(
    latestAllowedBirthDate.getUTCFullYear() - 18,
  );

  return latestAllowedBirthDate.toISOString().split("T")[0];
}

export default function OnboardingPage() {
  const router = useRouter();

  const [form, setForm] = useState<HealthProfileForm>(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadHealthProfile() {
      try {
        const response = await fetch("/api/health-profile", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 404) {
          setIsEditing(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load health profile.");
          return;
        }

        const profile = data.healthProfile;

        setForm({
          dateOfBirth: formatDateForInput(profile.dateOfBirth),
          heightCm:
            profile.heightCm !== null && profile.heightCm !== undefined
              ? String(profile.heightCm)
              : "",
          weightKg:
            profile.weightKg !== null && profile.weightKg !== undefined
              ? String(profile.weightKg)
              : "",
          bloodGroup: profile.bloodGroup ?? "",
          allergies: profile.allergies ?? "",
          medicalConditions: profile.medicalConditions ?? "",
          emergencyContactName: profile.emergencyContactName ?? "",
          emergencyContactPhone: profile.emergencyContactPhone ?? "",
          lastPeriodDate: formatDateForInput(profile.lastPeriodDate),
          averageCycleLength:
            profile.averageCycleLength !== null &&
            profile.averageCycleLength !== undefined
              ? String(profile.averageCycleLength)
              : "28",
          averagePeriodLength:
            profile.averagePeriodLength !== null &&
            profile.averagePeriodLength !== undefined
              ? String(profile.averagePeriodLength)
              : "5",
        });

        setIsEditing(true);
      } catch {
        setError("Something went wrong while loading your profile.");
      } finally {
        setLoadingProfile(false);
      }
    }

    loadHealthProfile();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/health-profile", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateOfBirth: form.dateOfBirth,
          heightCm: Number(form.heightCm),
          weightKg: Number(form.weightKg),
          bloodGroup: form.bloodGroup || undefined,
          allergies: form.allergies || undefined,
          medicalConditions: form.medicalConditions || undefined,
          emergencyContactName: form.emergencyContactName || undefined,
          emergencyContactPhone: form.emergencyContactPhone || undefined,
          lastPeriodDate: form.lastPeriodDate || undefined,
          averageCycleLength: form.averageCycleLength
            ? Number(form.averageCycleLength)
            : undefined,
          averagePeriodLength: form.averagePeriodLength
            ? Number(form.averagePeriodLength)
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            (isEditing
              ? "Failed to update profile."
              : "Failed to create profile."),
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50/70">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-sm text-gray-500">
            Loading your health profile...
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/70 text-pink-700 text-xs font-semibold">
            📋 Health &amp; Cycle Baseline
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {isEditing
              ? "Update Your Health Profile"
              : "Complete Your Health Profile"}
          </h1>

          <p className="text-gray-500 text-xs sm:text-sm max-w-lg mx-auto">
            Provide your baseline vitals and cycle preferences to calibrate
            accurate predictions and personalized recommendations.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Core Physical Vitals */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-pink-600">
              1. Physical Vitals
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  max={getLatestAllowedBirthDate()}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Height (cm) *
                </label>
                <input
                  name="heightCm"
                  type="number"
                  placeholder="e.g. 165"
                  value={form.heightCm}
                  onChange={handleChange}
                  required
                  min="50"
                  max="250"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  name="weightKg"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 60.5"
                  value={form.weightKg}
                  onChange={handleChange}
                  required
                  min="20"
                  max="300"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Blood Group
                </label>
                <input
                  name="bloodGroup"
                  placeholder="e.g. O+, A-, B+"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Known Allergies
                </label>
                <input
                  name="allergies"
                  placeholder="e.g. Penicillin, Peanuts, None"
                  value={form.allergies}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Medical Conditions / Diagnoses
              </label>
              <input
                name="medicalConditions"
                placeholder="e.g. PCOS, Endometriosis, Thyroid, None"
                value={form.medicalConditions}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Section 2: Menstrual Cycle Parameters */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-pink-600">
              2. Menstrual Cycle Baseline
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Last Period Start Date
                </label>
                <input
                  name="lastPeriodDate"
                  type="date"
                  value={form.lastPeriodDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Avg. Cycle Length (Days)
                </label>
                <input
                  name="averageCycleLength"
                  type="number"
                  placeholder="28"
                  value={form.averageCycleLength}
                  onChange={handleChange}
                  min="20"
                  max="60"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Avg. Period Duration (Days)
                </label>
                <input
                  name="averagePeriodLength"
                  type="number"
                  placeholder="5"
                  value={form.averagePeriodLength}
                  onChange={handleChange}
                  min="1"
                  max="14"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-pink-600">
              3. Emergency Contact (Optional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  name="emergencyContactName"
                  placeholder="e.g. Partner, Parent, Doctor"
                  value={form.emergencyContactName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  name="emergencyContactPhone"
                  placeholder="+1 (555) 000-0000"
                  value={form.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-pink-500 sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-pink-500/25 transition-all active:scale-[0.99] disabled:opacity-60"
          >
            {loading
              ? isEditing
                ? "Updating Profile..."
                : "Saving Profile..."
              : isEditing
                ? "Update Health Profile →"
                : "Save & Open Dashboard →"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
