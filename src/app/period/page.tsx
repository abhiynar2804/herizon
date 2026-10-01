"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type SymptomItem = {
  id: string;
  name: string;
  severity: string;
};

type CycleSymptom = {
  id?: string;
  symptom: {
    id: string;
    name: string;
    severity?: string;
  };
};

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
  symptoms?: CycleSymptom[];
};

export default function PeriodPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [availableSymptoms, setAvailableSymptoms] = useState<SymptomItem[]>([]);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit & Delete State
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editMood, setEditMood] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSymptomIds, setEditSymptomIds] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [cyclesResponse, symptomsResponse] = await Promise.all([
        fetch("/api/cycles"),
        fetch("/api/symptoms"),
      ]);

      const cyclesData = await cyclesResponse.json();
      const symptomsData = await symptomsResponse.json();

      if (!cyclesResponse.ok) {
        throw new Error(cyclesData.message ?? "Unable to load cycles.");
      }

      setCycles(cyclesData.cycles ?? []);

      if (symptomsResponse.ok) {
        setAvailableSymptoms(
          symptomsData.symptoms ?? (Array.isArray(symptomsData) ? symptomsData : [])
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load cycles.");
    } finally {
      setLoading(false);
    }
  }

  function toggleLogSymptom(id: string) {
    setSelectedSymptomIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleEditSymptom(id: string) {
    setEditSymptomIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
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
          symptomIds:
            selectedSymptomIds.length > 0 ? selectedSymptomIds : undefined,
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
      setSelectedSymptomIds([]);

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save period.");
    } finally {
      setSaving(false);
    }
  }

  // Open edit modal and populate state
  function handleEdit(cycle: Cycle) {
    setEditingCycle(cycle);
    // Format YYYY-MM-DD for date input fields
    setEditStartDate(cycle.startDate ? cycle.startDate.split("T")[0] : "");
    setEditEndDate(cycle.endDate ? cycle.endDate.split("T")[0] : "");
    setEditMood(cycle.mood ?? "");
    setEditNotes(cycle.notes ?? "");
    setEditSymptomIds(
      cycle.symptoms?.map((s) => s.symptom.id) ?? []
    );
    setEditError("");
  }

  // Submit edit form to PATCH endpoint
  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCycle) return;

    try {
      setEditSaving(true);
      setEditError("");

      const response = await fetch(`/api/cycles/${editingCycle.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: editStartDate || undefined,
          endDate: editEndDate || undefined,
          mood: editMood || undefined,
          notes: editNotes || undefined,
          symptomIds: editSymptomIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to update cycle.");
      }

      setEditingCycle(null);
      setSuccess("Cycle updated successfully.");
      await loadData();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Unable to update cycle.",
      );
    } finally {
      setEditSaving(false);
    }
  }

  // Call DELETE endpoint
  async function handleDeleteCycle(id: string) {
    if (!window.confirm("Are you sure you want to delete this cycle record?")) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/cycles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to delete cycle.");
      }

      setSuccess("Cycle deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete cycle.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
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
            Record menstruation dates, link experienced symptoms, and view personalized
            phase predictions.
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Linked Symptoms Selector (Plan #10) */}
            {availableSymptoms.length > 0 && (
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Symptoms Experienced During This Cycle (Optional)
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {availableSymptoms.map((symptom) => {
                    const selected = selectedSymptomIds.includes(symptom.id);

                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => toggleLogSymptom(symptom.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                          selected
                            ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                            : "bg-gray-50/60 text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50/30"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {symptom.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
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

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
                        {cycle.periodLength
                          ? `${cycle.periodLength} days period`
                          : "Ongoing"}
                      </span>

                      {/* Action Buttons */}
                      <button
                        type="button"
                        onClick={() => handleEdit(cycle)}
                        className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCycle(cycle.id)}
                        disabled={deletingId === cycle.id}
                        className="px-2.5 py-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50 transition"
                      >
                        {deletingId === cycle.id ? "Deleting..." : "🗑️ Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                    <div className="p-3 rounded-2xl bg-gray-50">
                      <span className="text-gray-400 block text-[11px]">
                        Cycle Length
                      </span>
                      <span className="font-semibold text-gray-800 mt-0.5 block">
                        {cycle.cycleLength
                          ? `${cycle.cycleLength} days`
                          : "Calculating..."}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-pink-50/50">
                      <span className="text-pink-600 block text-[11px]">
                        Next Period
                      </span>
                      <span className="font-bold text-pink-900 mt-0.5 block">
                        {formatDate(cycle.predictedNextPeriod)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50/50">
                      <span className="text-purple-600 block text-[11px]">
                        Ovulation
                      </span>
                      <span className="font-bold text-purple-900 mt-0.5 block">
                        {formatDate(cycle.predictedOvulation)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50">
                      <span className="text-gray-400 block text-[11px]">
                        Fertile Window
                      </span>
                      <span className="font-semibold text-gray-800 mt-0.5 block">
                        {cycle.fertileStart && cycle.fertileEnd
                          ? `${formatDate(cycle.fertileStart)} – ${formatDate(cycle.fertileEnd)}`
                          : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Linked Symptoms Display on Cycle Card (Plan #10) */}
                  {cycle.symptoms && cycle.symptoms.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-gray-400 mr-1">
                        Symptoms:
                      </span>
                      {cycle.symptoms.map((item) => (
                        <span
                          key={item.symptom.id}
                          className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-xs text-rose-700 font-medium"
                        >
                          {item.symptom.name}
                        </span>
                      ))}
                    </div>
                  )}

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

        {/* Edit Modal Overlay */}
        {editingCycle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-pink-100 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  ✏️ Edit Cycle Record
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCycle(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="editStartDate"
                      className="mb-1 block text-xs font-semibold text-gray-700"
                    >
                      Start Date *
                    </label>
                    <input
                      id="editStartDate"
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="editEndDate"
                      className="mb-1 block text-xs font-semibold text-gray-700"
                    >
                      End Date (Optional)
                    </label>
                    <input
                      id="editEndDate"
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Edit Modal Symptoms Selector (Plan #10) */}
                {availableSymptoms.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Symptoms Experienced
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/30">
                      {availableSymptoms.map((symptom) => {
                        const selected = editSymptomIds.includes(symptom.id);

                        return (
                          <button
                            key={symptom.id}
                            type="button"
                            onClick={() => toggleEditSymptom(symptom.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                              selected
                                ? "bg-pink-600 text-white border-pink-600"
                                : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                            }`}
                          >
                            {selected ? "✓ " : "+ "}
                            {symptom.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="editMood"
                    className="mb-1 block text-xs font-semibold text-gray-700"
                  >
                    Mood &amp; Sensations
                  </label>
                  <input
                    id="editMood"
                    type="text"
                    value={editMood}
                    onChange={(e) => setEditMood(e.target.value)}
                    maxLength={100}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="editNotes"
                    className="mb-1 block text-xs font-semibold text-gray-700"
                  >
                    Personal Notes
                  </label>
                  <textarea
                    id="editNotes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    maxLength={2000}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>

                {editError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                    {editError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCycle(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="rounded-xl bg-pink-600 hover:bg-pink-700 px-5 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition"
                  >
                    {editSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
