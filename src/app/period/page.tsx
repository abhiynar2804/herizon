"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Cycle = {
  id: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number | null;
  periodLength: number | null;
  mood: string | null;
  notes: string | null;
  predictedNextPeriod: string | null;
  predictedOvulation: string | null;
  fertileStart: string | null;
  fertileEnd: string | null;
  phase: string;
};

export default function PeriodPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCycles();
  }, []);

  async function loadCycles() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/cycles");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to load cycles.");
      }

      setCycles(data.cycles ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load cycles."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!startDate) {
      setError("Please select a period start date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/cycles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate: endDate || undefined,
          mood: mood || undefined,
          notes: notes || undefined,
          isPrivate: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to save period.");
      }

      setSuccess("Period recorded successfully.");
      setStartDate("");
      setEndDate("");
      setMood("");
      setNotes("");

      await loadCycles();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save period."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/70 text-pink-700 text-xs font-semibold">
            🌸 Reproductive Health Tracker
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Period &amp; Cycle Intelligence
          </h1>
          <p className="text-gray-500 text-sm">
            Record menstruation dates, track symptoms, and view personalized phase predictions.
          </p>
        </header>

        {/* Log Period Form Card */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>✨ Log New Period</span>
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Period Start Date *
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Period End Date (Optional)
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="mood"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Mood &amp; Sensations
              </label>
              <input
                id="mood"
                type="text"
                value={mood}
                onChange={(event) => setMood(event.target.value)}
                maxLength={100}
                placeholder="e.g. Energetic, mild cramps, calm, tender breasts"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Personal Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Any dietary notes, sleep changes, or flow intensity..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                ✓ {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save Period"}
            </button>
          </form>
        </section>

        {/* History List */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Recorded Cycles &amp; Predictions
          </h2>

          {loading ? (
            <div className="rounded-3xl bg-white p-8 text-center text-xs text-gray-500">
              Loading cycle records...
            </div>
          ) : cycles.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center text-xs text-gray-500">
              No cycle records found. Add your first record above!
            </div>
          ) : (
            <div className="space-y-4">
              {cycles.map((cycle) => (
                <article
                  key={cycle.id}
                  className="rounded-3xl bg-white p-6 shadow-xs border border-pink-100/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {formatDate(cycle.startDate)}
                        {" → "}
                        {formatDate(cycle.endDate)}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Phase:{" "}
                        <span className="font-semibold text-pink-600">
                          {cycle.phase}
                        </span>
                      </p>
                    </div>

                    <span className="rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
                      {cycle.periodLength
                        ? `${cycle.periodLength} days period`
                        : "Ongoing"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                    <div className="p-3 rounded-2xl bg-gray-50">
                      <span className="text-gray-400 block text-[11px]">Cycle Length</span>
                      <span className="font-semibold text-gray-800 mt-0.5 block">
                        {cycle.cycleLength ? `${cycle.cycleLength} days` : "Calculating..."}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-pink-50/50">
                      <span className="text-pink-600 block text-[11px]">Next Period</span>
                      <span className="font-bold text-pink-900 mt-0.5 block">
                        {formatDate(cycle.predictedNextPeriod)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50/50">
                      <span className="text-purple-600 block text-[11px]">Ovulation</span>
                      <span className="font-bold text-purple-900 mt-0.5 block">
                        {formatDate(cycle.predictedOvulation)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50">
                      <span className="text-gray-400 block text-[11px]">Fertile Window</span>
                      <span className="font-semibold text-gray-800 mt-0.5 block">
                        {cycle.fertileStart && cycle.fertileEnd
                          ? `${formatDate(cycle.fertileStart)} – ${formatDate(cycle.fertileEnd)}`
                          : "Pending"}
                      </span>
                    </div>
                  </div>

                  {cycle.mood && (
                    <p className="mt-3 text-xs text-gray-600">
                      <strong>Mood / Sensations:</strong> {cycle.mood}
                    </p>
                  )}

                  {cycle.notes && (
                    <p className="mt-1 text-xs text-gray-500">
                      <strong>Notes:</strong> {cycle.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}