"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [form, setForm] = useState({
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
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
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
        method: "POST",
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
          emergencyContactName:
            form.emergencyContactName || undefined,
          emergencyContactPhone:
            form.emergencyContactPhone || undefined,
          lastPeriodDate:
            form.lastPeriodDate || undefined,
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
        setError(data.message || "Failed to create profile.");
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

  return (
    <main>
      <h1>Complete Your Health Profile</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="dateOfBirth"
          type="date"
          value={form.dateOfBirth}
          onChange={handleChange}
          required
        />

        <input
          name="heightCm"
          type="number"
          placeholder="Height (cm)"
          value={form.heightCm}
          onChange={handleChange}
          required
        />

        <input
          name="weightKg"
          type="number"
          placeholder="Weight (kg)"
          value={form.weightKg}
          onChange={handleChange}
          required
        />

        <input
          name="bloodGroup"
          placeholder="Blood Group"
          value={form.bloodGroup}
          onChange={handleChange}
        />

        <input
          name="allergies"
          placeholder="Allergies"
          value={form.allergies}
          onChange={handleChange}
        />

        <input
          name="medicalConditions"
          placeholder="Medical Conditions"
          value={form.medicalConditions}
          onChange={handleChange}
        />

        <input
          name="emergencyContactName"
          placeholder="Emergency Contact Name"
          value={form.emergencyContactName}
          onChange={handleChange}
        />

        <input
          name="emergencyContactPhone"
          placeholder="Emergency Contact Phone"
          value={form.emergencyContactPhone}
          onChange={handleChange}
        />

        <input
          name="lastPeriodDate"
          type="date"
          value={form.lastPeriodDate}
          onChange={handleChange}
        />

        <input
          name="averageCycleLength"
          type="number"
          placeholder="Average Cycle Length"
          value={form.averageCycleLength}
          onChange={handleChange}
        />

        <input
          name="averagePeriodLength"
          type="number"
          placeholder="Average Period Length"
          value={form.averagePeriodLength}
          onChange={handleChange}
        />

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </main>
  );
}