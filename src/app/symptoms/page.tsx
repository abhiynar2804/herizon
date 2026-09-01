"use client";

import { useEffect, useState } from "react";

type Symptom = {
  id: string;
  name: string;
  description: string | null;
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

      const [symptomsResponse, historyResponse] =
        await Promise.all([
          fetch("/api/symptoms"),
          fetch("/api/symptoms/history"),
        ]);

      const symptomsData = await symptomsResponse.json();
      const historyData = await historyResponse.json();

      if (!symptomsResponse.ok) {
        throw new Error(
          symptomsData.message ??
            "Unable to load symptoms."
        );
      }

      if (!historyResponse.ok) {
        throw new Error(
          historyData.message ??
            "Unable to load symptom history."
        );
      }

      setSymptoms(symptomsData.symptoms ?? symptomsData);
      setHistory(historyData ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load symptom data."
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
      setResult(null);

      const response = await fetch(
        "/api/symptoms/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptomIds: selectedSymptoms,
            notes: notes || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Unable to process symptom check."
        );
      }

      setResult(data.result);

      setSelectedSymptoms([]);
      setNotes("");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process symptom check."
      );
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-500">
            Loading symptoms...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-medium text-pink-600">
            Herizon
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Symptom Checker
          </h1>

          <p className="mt-2 text-gray-500">
            Select your symptoms to receive a rule-based
            health assessment.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            What are you experiencing?
          </h2>

          {symptoms.length === 0 ? (
            <p className="mt-4 text-gray-500">
              No active symptoms are available.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {symptoms.map((symptom) => {
                const selected =
                  selectedSymptoms.includes(symptom.id);

                return (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() =>
                      toggleSymptom(symptom.id)
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">
                        {symptom.name}
                      </span>

                      <span className="text-xs text-gray-500">
                        {symptom.severity}
                      </span>
                    </div>

                    {symptom.description && (
                      <p className="mt-2 text-sm text-gray-500">
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
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Additional notes
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              maxLength={2000}
              rows={4}
              placeholder="Describe anything else you noticed..."
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleCheck}
            disabled={
              checking || selectedSymptoms.length === 0
            }
            className="mt-5 rounded-lg bg-pink-600 px-5 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {checking
              ? "Checking..."
              : "Check Symptoms"}
          </button>
        </section>

        {result && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Assessment
            </h2>

            <div className="mt-4 space-y-3">
              <p className="font-medium text-gray-900">
                {result.title}
              </p>

              <p className="text-sm text-gray-600">
                {result.recommendation}
              </p>

              <p className="text-sm text-gray-600">
                Priority:{" "}
                <strong>{result.priority}</strong>
              </p>

              {result.isEmergency && (
                <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                  This assessment indicates an emergency
                  concern. Seek appropriate professional
                  medical help immediately.
                </p>
              )}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Symptom History
          </h2>

          {history.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-gray-500">
                No symptom checks yet.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {history.map((check) => (
                <article
                  key={check.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">
                      Symptom Check
                    </h3>

                    <span className="text-sm text-gray-500">
                      {new Date(
                        check.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {check.symptoms.map((item) => (
                      <span
                        key={item.symptom.id}
                        className="rounded-full bg-pink-50 px-3 py-1 text-sm text-pink-700"
                      >
                        {item.symptom.name}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-sm text-gray-600">
                    <strong>Priority:</strong>{" "}
                    {check.urgencyLevel ??
                      "Not specified"}
                  </p>

                  {check.recommendation && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Recommendation:</strong>{" "}
                      {check.recommendation}
                    </p>
                  )}

                  {check.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Notes:</strong>{" "}
                      {check.notes}
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