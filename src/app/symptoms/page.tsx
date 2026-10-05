"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Symptom = {
  id: string;
  name: string;
  description: string | null;
  recommendation?: string | null;
  severity: string;
};

type SymptomHistory = {
  id: string;
  notes: string | null;
  recommendation: string | null;
  urgencyLevel: string | null;
  createdAt: string;
  symptoms: {
    symptom: Symptom;
  }[];
};

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [history, setHistory] = useState<SymptomHistory[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit & Delete State
  const [editingCheck, setEditingCheck] = useState<SymptomHistory | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [result, setResult] = useState<{
    title: string;
    recommendation: string;
    priority: string;
    isEmergency: boolean;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [symptomsResponse, historyResponse] = await Promise.all([
        fetch("/api/symptoms"),
        fetch("/api/symptoms/history"),
      ]);

      const symptomsData = await symptomsResponse.json();
      const historyData = await historyResponse.json();

      if (!symptomsResponse.ok) {
        throw new Error(symptomsData.message ?? "Unable to load symptoms.");
      }

      if (!historyResponse.ok) {
        throw new Error(historyData.message ?? "Unable to load symptom history.");
      }

      setSymptoms(symptomsData.symptoms ?? symptomsData);
      setHistory(historyData ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load symptom data."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleSymptom(id: string) {
    setSelectedSymptoms((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function handleCheck() {
    if (selectedSymptoms.length === 0) {
      setError("Select at least one symptom.");
      return;
    }

    try {
      setChecking(true);
      setError("");
      setSuccess("");
      setResult(null);

      const response = await fetch("/api/symptoms/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptomIds: selectedSymptoms,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to process symptom check.");
      }

      setResult(data.result);
      setSelectedSymptoms([]);
      setNotes("");
      setSuccess("Symptom assessment completed.");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process symptom check."
      );
    } finally {
      setChecking(false);
    }
  }

  function handleEditCheck(check: SymptomHistory) {
    setEditingCheck(check);
    setEditNotes(check.notes ?? "");
    setEditError("");
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCheck) return;

    try {
      setEditSaving(true);
      setEditError("");

      const response = await fetch(`/api/symptoms/history/${editingCheck.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: editNotes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to update symptom check.");
      }

      setEditingCheck(null);
      setSuccess("Symptom check notes updated successfully.");
      await loadData();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Unable to update symptom check."
      );
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteCheck(id: string) {
    if (!window.confirm("Are you sure you want to delete this symptom check record?")) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/symptoms/history/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to delete symptom check.");
      }

      setSuccess("Symptom check record deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete symptom check."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/70 text-purple-700 text-xs font-semibold">
            🩺 Clinical &amp; PCOS Symptom Checker
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Symptom Assessment Engine
          </h1>
          <p className="text-gray-500 text-sm">
            Select what you are experiencing to receive evidence-based triage and personalized guidance.
          </p>
        </header>

        {/* Symptom Selector Section */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60">
          <h2 className="text-lg font-bold text-gray-900">
            What symptoms are you noticing?
          </h2>

          {loading ? (
            <p className="mt-4 text-xs text-gray-500">Loading symptoms...</p>
          ) : symptoms.length === 0 ? (
            <p className="mt-4 text-xs text-gray-500">No active symptoms available.</p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {symptoms.map((symptom) => {
                const selected = selectedSymptoms.includes(symptom.id);

                return (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? "border-pink-500 bg-pink-50/80 shadow-xs ring-1 ring-pink-500"
                        : "border-gray-200 bg-white hover:bg-gray-50/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-gray-900 text-sm">
                        {symptom.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          selected
                            ? "bg-pink-200 text-pink-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {symptom.severity}
                      </span>
                    </div>

                    {symptom.description && (
                      <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                        {symptom.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6">
            <label
              htmlFor="notes"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Additional observations (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Describe pain intensity, timing, or anything else you notice..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          {error && (
            <p className="mt-4 text-xs text-red-600 font-medium">{error}</p>
          )}

          {success && (
            <p className="mt-4 text-xs text-emerald-600 font-medium">✓ {success}</p>
          )}

          <button
            type="button"
            onClick={handleCheck}
            disabled={checking || selectedSymptoms.length === 0}
            className="mt-6 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 px-6 py-2.5 font-semibold text-white text-sm shadow-xs disabled:opacity-50 transition"
          >
            {checking ? "Analyzing Symptoms..." : "Assess Selected Symptoms"}
          </button>
        </section>

        {/* Assessment Result */}
        {result && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h2 className="text-lg font-bold text-gray-900">
                Assessment Results
              </h2>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-gray-900 text-base">
                {result.title}
              </p>

              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                {result.recommendation}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-gray-500">
                  Priority:{" "}
                  <span className="font-bold text-purple-700">
                    {result.priority}
                  </span>
                </span>
              </div>

              {result.isEmergency && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 font-medium">
                  ⚠️ This assessment indicates a high-priority or emergency concern. Please contact a licensed medical practitioner immediately.
                </div>
              )}
            </div>
          </section>
        )}

        {/* History */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Past Symptom Checks
          </h2>

          {history.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center text-xs text-gray-500">
              No symptom checks recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((check) => (
                <article
                  key={check.id}
                  className="rounded-3xl bg-white p-6 shadow-xs border border-pink-100/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        Symptom Check Summary
                      </h3>
                      <span className="text-xs text-gray-400">
                        {new Date(check.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditCheck(check)}
                        className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      >
                        ✏️ Edit Notes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCheck(check.id)}
                        disabled={deletingId === check.id}
                        className="px-2.5 py-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50 transition"
                      >
                        {deletingId === check.id ? "Deleting..." : "🗑️ Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {check.symptoms.map((item) => (
                      <span
                        key={item.symptom.id}
                        className="rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-xs font-semibold text-pink-700"
                      >
                        {item.symptom.name}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    <strong>Urgency:</strong> {check.urgencyLevel ?? "Standard"}
                  </p>

                  {check.recommendation && (
                    <p className="mt-1 text-xs text-gray-600">
                      <strong>Recommendation:</strong> {check.recommendation}
                    </p>
                  )}

                  {check.notes && (
                    <p className="mt-1 text-xs text-gray-500">
                      <strong>Notes:</strong> {check.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Edit Notes Modal Overlay */}
        {editingCheck && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  ✏️ Edit Symptom Notes
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCheck(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {editingCheck.symptoms.map((item) => (
                    <span
                      key={item.symptom.id}
                      className="rounded-full bg-purple-50 border border-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700"
                    >
                      {item.symptom.name}
                    </span>
                  ))}
                </div>
                {editingCheck.recommendation && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl">
                    <span className="font-semibold text-gray-700">Recommendation: </span>
                    {editingCheck.recommendation}
                  </p>
                )}
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="editNotesInput"
                    className="mb-1 block text-xs font-semibold text-gray-700"
                  >
                    Personal Observations / Notes
                  </label>
                  <textarea
                    id="editNotesInput"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    placeholder="Update your notes for this check..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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
                    onClick={() => setEditingCheck(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-5 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition"
                  >
                    {editSaving ? "Saving..." : "Save Notes"}
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