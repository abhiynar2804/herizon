"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminNavbar from "@/components/layout/AdminNavbar";

type SymptomSeverityLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
type RulePriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type Symptom = {
  id: string;
  name: string;
  description: string | null;
  recommendation: string | null;
  severity: SymptomSeverityLevel;
  isActive: boolean;
};

type SymptomRule = {
  id: string;
  title: string;
  recommendation: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  isEmergency: boolean;
  isActive: boolean;
  conditions: {
    symptom: {
      id: string;
      name: string;
    };
  }[];
};

export default function AdminSymptomsPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [rules, setRules] = useState<SymptomRule[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Symptom Create Form State
  const [symptomName, setSymptomName] = useState("");
  const [symptomDesc, setSymptomDesc] = useState("");
  const [symptomRec, setSymptomRec] = useState("");
  const [symptomSeverity, setSymptomSeverity] =
    useState<SymptomSeverityLevel>("LOW");
  const [addingSymptom, setAddingSymptom] = useState(false);

  // Symptom Edit State (Plan #04)
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const [editSymName, setEditSymName] = useState("");
  const [editSymDesc, setEditSymDesc] = useState("");
  const [editSymRec, setEditSymRec] = useState("");
  const [editSymSeverity, setEditSymSeverity] =
    useState<SymptomSeverityLevel>("LOW");
  const [savingSymptom, setSavingSymptom] = useState(false);
  const [deletingSymptomId, setDeletingSymptomId] = useState<string | null>(null);

  // Rule Create Form State
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleRec, setRuleRec] = useState("");
  const [rulePriority, setRulePriority] = useState<RulePriorityLevel>("MEDIUM");
  const [ruleEmergency, setRuleEmergency] = useState(false);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [addingRule, setAddingRule] = useState(false);

  // Rule Edit State (Plan #04)
  const [editingRule, setEditingRule] = useState<SymptomRule | null>(null);
  const [editRuleTitle, setEditRuleTitle] = useState("");
  const [editRuleRec, setEditRuleRec] = useState("");
  const [editRulePriority, setEditRulePriority] =
    useState<RulePriorityLevel>("MEDIUM");
  const [editRuleEmergency, setEditRuleEmergency] = useState(false);
  const [editRuleSymptomIds, setEditRuleSymptomIds] = useState<string[]>([]);
  const [savingRule, setSavingRule] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setError("");

      const [symRes, ruleRes] = await Promise.all([
        fetch("/api/admin/symptoms"),
        fetch("/api/admin/symptom-rules"),
      ]);

      const symData = await symRes.json();
      const ruleData = await ruleRes.json();

      if (!symRes.ok)
        throw new Error(symData.message || "Failed to load symptoms.");
      if (!ruleRes.ok)
        throw new Error(ruleData.message || "Failed to load rules.");

      setSymptoms(symData.symptoms || []);
      setRules(ruleData.rules || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error loading symptom engine data.",
      );
    }
  }

  // SYMPTOM ACTIONS
  async function handleAddSymptom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!symptomName.trim()) return;

    try {
      setAddingSymptom(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: symptomName.trim(),
          description: symptomDesc.trim() || undefined,
          recommendation: symptomRec.trim() || undefined,
          severity: symptomSeverity,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create symptom.");

      setSuccess("Symptom added successfully!");
      setSymptomName("");
      setSymptomDesc("");
      setSymptomRec("");
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding symptom.");
    } finally {
      setAddingSymptom(false);
    }
  }

  function handleStartEditSymptom(s: Symptom) {
    setEditingSymptom(s);
    setEditSymName(s.name);
    setEditSymDesc(s.description || "");
    setEditSymRec(s.recommendation || "");
    setEditSymSeverity(s.severity);
    setError("");
  }

  async function handleUpdateSymptom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingSymptom || !editSymName.trim()) return;

    try {
      setSavingSymptom(true);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/admin/symptoms/${editingSymptom.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editSymName.trim(),
          description: editSymDesc.trim() || undefined,
          recommendation: editSymRec.trim() || undefined,
          severity: editSymSeverity,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update symptom.");

      setSuccess("Symptom updated successfully!");
      setEditingSymptom(null);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating symptom.");
    } finally {
      setSavingSymptom(false);
    }
  }

  async function handleDeleteSymptom(id: string) {
    if (!confirm("Are you sure you want to deactivate this symptom?")) return;

    try {
      setDeletingSymptomId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/admin/symptoms/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to deactivate symptom.");

      setSuccess("Symptom deactivated successfully.");
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting symptom.");
    } finally {
      setDeletingSymptomId(null);
    }
  }

  // RULE ACTIONS
  async function handleAddRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !ruleTitle.trim() ||
      !ruleRec.trim() ||
      selectedSymptomIds.length === 0
    ) {
      setError(
        "Please provide rule title, recommendation, and select at least one symptom condition.",
      );
      return;
    }

    try {
      setAddingRule(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/symptom-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ruleTitle.trim(),
          recommendation: ruleRec.trim(),
          priority: rulePriority,
          isEmergency: ruleEmergency,
          symptomIds: selectedSymptomIds,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create rule.");

      setSuccess("Symptom Rule created successfully!");
      setRuleTitle("");
      setRuleRec("");
      setRuleEmergency(false);
      setSelectedSymptomIds([]);
      await loadAllData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error creating symptom rule.",
      );
    } finally {
      setAddingRule(false);
    }
  }

  function handleStartEditRule(r: SymptomRule) {
    setEditingRule(r);
    setEditRuleTitle(r.title);
    setEditRuleRec(r.recommendation);
    setEditRulePriority(r.priority);
    setEditRuleEmergency(r.isEmergency);
    setEditRuleSymptomIds(r.conditions.map((c) => c.symptom.id));
    setError("");
  }

  async function handleUpdateRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !editingRule ||
      !editRuleTitle.trim() ||
      !editRuleRec.trim() ||
      editRuleSymptomIds.length === 0
    ) {
      setError(
        "Please provide rule title, recommendation, and select at least one symptom condition.",
      );
      return;
    }

    try {
      setSavingRule(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/symptom-rules/${editingRule.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editRuleTitle.trim(),
            recommendation: editRuleRec.trim(),
            priority: editRulePriority,
            isEmergency: editRuleEmergency,
            symptomIds: editRuleSymptomIds,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update symptom rule.");

      setSuccess("Symptom Rule updated successfully!");
      setEditingRule(null);
      await loadAllData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error updating symptom rule.",
      );
    } finally {
      setSavingRule(false);
    }
  }

  async function handleDeleteRule(id: string) {
    if (!confirm("Are you sure you want to deactivate this rule?")) return;

    try {
      setDeletingRuleId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/admin/symptom-rules/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to deactivate rule.");

      setSuccess("Rule deactivated successfully.");
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting rule.");
    } finally {
      setDeletingRuleId(null);
    }
  }

  function toggleSymptomSelection(id: string) {
    setSelectedSymptomIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleEditRuleSymptomSelection(id: string) {
    setEditRuleSymptomIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Symptoms &amp; Rule Engine Management
          </h1>
          <p className="text-xs text-slate-400">
            Define symptoms, edit clinical thresholds, and configure triage rules.
          </p>
        </header>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-xs text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300">
            ✓ {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Symptoms Management (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Add Symptom Form */}
            <section className="rounded-3xl bg-slate-900/80 p-6 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-pink-400">
                Add New Symptom Entry
              </h2>

              <form onSubmit={handleAddSymptom} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Symptom Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={symptomName}
                    onChange={(e) => setSymptomName(e.target.value)}
                    placeholder="e.g. Severe Lower Abdominal Cramps"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Severity Level
                  </label>
                  <select
                    value={symptomSeverity}
                    onChange={(e) =>
                      setSymptomSeverity(e.target.value as SymptomSeverityLevel)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Description (What is this symptom?)
                  </label>
                  <textarea
                    rows={2}
                    value={symptomDesc}
                    onChange={(e) => setSymptomDesc(e.target.value)}
                    placeholder="Describe what the symptom is or how it presents..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Clinical Recommendation / Guidance (Actionable advice)
                  </label>
                  <textarea
                    rows={3}
                    value={symptomRec}
                    onChange={(e) => setSymptomRec(e.target.value)}
                    placeholder="Specific care steps, relief remedies, or medical guidance for this symptom..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingSymptom}
                  className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 font-semibold text-white transition disabled:opacity-50"
                >
                  {addingSymptom ? "Adding..." : "+ Create Symptom"}
                </button>
              </form>
            </section>

            {/* Symptoms List with Edit & Delete (Plan #04) */}
            <section className="rounded-3xl bg-slate-900/80 p-6 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Active Symptoms Directory ({symptoms.length})
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {symptoms.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{s.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            s.severity === "CRITICAL"
                              ? "bg-red-950 text-red-300 border border-red-800"
                              : s.severity === "HIGH"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : s.severity === "MODERATE"
                              ? "bg-purple-950 text-purple-300 border border-purple-800"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {s.severity}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditSymptom(s)}
                          className="px-2.5 py-1 rounded-lg bg-pink-950/60 hover:bg-pink-900/80 text-pink-300 border border-pink-800/60 text-xs transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSymptom(s.id)}
                          disabled={deletingSymptomId === s.id}
                          className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-xs transition disabled:opacity-50"
                        >
                          {deletingSymptomId === s.id ? "..." : "Deactivate"}
                        </button>
                      </div>
                    </div>

                    {s.description && (
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        <strong className="text-slate-300">ℹ️ Description:</strong> {s.description}
                      </p>
                    )}

                    {s.recommendation && (
                      <p className="text-pink-300/90 text-[11px] leading-relaxed bg-pink-950/30 p-2 rounded-xl border border-pink-900/40">
                        <strong className="text-pink-200">💡 Care Guidance:</strong> {s.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Symptom Rules Builder (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Create Rule Form */}
            <section className="rounded-3xl bg-slate-900/80 p-6 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
                Rule Engine Configuration
              </h2>

              <form onSubmit={handleAddRule} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Rule Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={ruleTitle}
                    onChange={(e) => setRuleTitle(e.target.value)}
                    placeholder="e.g. Acute Pelvic Pain + High Fever Alert"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Priority Level
                    </label>
                    <select
                      value={rulePriority}
                      onChange={(e) =>
                        setRulePriority(e.target.value as RulePriorityLevel)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={ruleEmergency}
                        onChange={(e) => setRuleEmergency(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-red-500 h-4 w-4"
                      />
                      <span className="text-xs text-red-400 font-semibold">
                        Emergency Flag
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Select Symptom Conditions (Click to select multiple) *
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {symptoms.map((s) => {
                      const selected = selectedSymptomIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSymptomSelection(s.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                            selected
                              ? "bg-purple-600 text-white font-bold"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Recommendation / Triage Instructions *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={ruleRec}
                    onChange={(e) => setRuleRec(e.target.value)}
                    placeholder="Advise user on rest, fluid intake, or emergency clinical consultation..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingRule}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold text-white transition disabled:opacity-50"
                >
                  {addingRule ? "Creating Rule..." : "+ Save Symptom Rule"}
                </button>
              </form>
            </section>

            {/* Configured Rules List with Edit & Delete (Plan #04) */}
            <section className="rounded-3xl bg-slate-900/80 p-6 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Configured Triage Rules ({rules.length})
              </h2>

              <div className="space-y-3">
                {rules.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{r.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                          {r.priority}
                        </span>
                        {r.isEmergency && (
                          <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                            EMERGENCY
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEditRule(r)}
                          className="px-2 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60 text-xs transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(r.id)}
                          disabled={deletingRuleId === r.id}
                          className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-xs transition disabled:opacity-50"
                        >
                          {deletingRuleId === r.id ? "..." : "Deactivate"}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {r.conditions.map((c) => (
                        <span
                          key={c.symptom.id}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]"
                        >
                          {c.symptom.name}
                        </span>
                      ))}
                    </div>

                    <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                      {r.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Symptom Edit Modal Overlay (Plan #04) */}
        {editingSymptom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  ✏️ Edit Symptom
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingSymptom(null)}
                  className="text-slate-400 hover:text-white text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateSymptom} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Symptom Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editSymName}
                    onChange={(e) => setEditSymName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Severity Level
                  </label>
                  <select
                    value={editSymSeverity}
                    onChange={(e) =>
                      setEditSymSeverity(e.target.value as SymptomSeverityLevel)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Description (What is this symptom?)
                  </label>
                  <textarea
                    rows={2}
                    value={editSymDesc}
                    onChange={(e) => setEditSymDesc(e.target.value)}
                    placeholder="Describe what the symptom is..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Clinical Recommendation / Guidance (Actionable advice)
                  </label>
                  <textarea
                    rows={3}
                    value={editSymRec}
                    onChange={(e) => setEditSymRec(e.target.value)}
                    placeholder="Specific care steps or remedies for this symptom..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingSymptom(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSymptom}
                    className="rounded-xl bg-pink-600 hover:bg-pink-700 px-5 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition"
                  >
                    {savingSymptom ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rule Edit Modal Overlay (Plan #04) */}
        {editingRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  ✏️ Edit Triage Rule
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="text-slate-400 hover:text-white text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateRule} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Rule Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editRuleTitle}
                    onChange={(e) => setEditRuleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Priority Level
                    </label>
                    <select
                      value={editRulePriority}
                      onChange={(e) =>
                        setEditRulePriority(e.target.value as RulePriorityLevel)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editRuleEmergency}
                        onChange={(e) => setEditRuleEmergency(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-red-500 h-4 w-4"
                      />
                      <span className="text-xs text-red-400 font-semibold">
                        Emergency Flag
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Select Symptom Conditions *
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {symptoms.map((s) => {
                      const selected = editRuleSymptomIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleEditRuleSymptomSelection(s.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                            selected
                              ? "bg-purple-600 text-white font-bold"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Recommendation / Triage Instructions *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editRuleRec}
                    onChange={(e) => setEditRuleRec(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingRule(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingRule}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition"
                  >
                    {savingRule ? "Saving..." : "Save Rule Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
