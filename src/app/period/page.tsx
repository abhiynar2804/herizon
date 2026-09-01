"use client";

import { FormEvent, useEffect, useState } from "react";

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
        err instanceof Error
          ? err.message
          : "Unable to load cycles."
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
        err instanceof Error
          ? err.message
          : "Unable to save period."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-medium text-pink-600">
            Herizon
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Period Tracker
          </h1>

          <p className="mt-2 text-gray-500">
            Record your cycle and view calculated predictions.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Log Period
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Start Date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  End Date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="mood"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Mood
              </label>

              <input
                id="mood"
                type="text"
                value={mood}
                onChange={(event) =>
                  setMood(event.target.value)
                }
                maxLength={100}
                placeholder="e.g. Calm, tired, energetic"
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Notes
              </label>

              <textarea
                id="notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                maxLength={2000}
                rows={4}
                placeholder="Optional notes..."
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-600">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-pink-600 px-5 py-2.5 font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Period"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Cycle History
          </h2>

          {loading ? (
            <p className="mt-4 text-gray-500">
              Loading cycles...
            </p>
          ) : cycles.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-gray-500">
                No cycle records yet.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {cycles.map((cycle) => (
                <article
                  key={cycle.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {formatDate(cycle.startDate)}
                        {" → "}
                        {formatDate(cycle.endDate)}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Phase: {cycle.phase}
                      </p>
                    </div>

                    <span className="rounded-full bg-pink-50 px-3 py-1 text-sm text-pink-700">
                      {cycle.periodLength
                        ? `${cycle.periodLength} day period`
                        : "Period length pending"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                    <p>
                      Cycle length:{" "}
                      {cycle.cycleLength
                        ? `${cycle.cycleLength} days`
                        : "Not available"}
                    </p>

                    <p>
                      Next period:{" "}
                      {formatDate(cycle.predictedNextPeriod)}
                    </p>

                    <p>
                      Ovulation:{" "}
                      {formatDate(cycle.predictedOvulation)}
                    </p>

                    <p>
                      Fertile window:{" "}
                      {cycle.fertileStart &&
                      cycle.fertileEnd
                        ? `${formatDate(
                            cycle.fertileStart
                          )} – ${formatDate(
                            cycle.fertileEnd
                          )}`
                        : "Not available"}
                    </p>
                  </div>

                  {cycle.mood && (
                    <p className="mt-4 text-sm text-gray-600">
                      <strong>Mood:</strong> {cycle.mood}
                    </p>
                  )}

                  {cycle.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Notes:</strong> {cycle.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}