import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Helper for Phase Information & Hormone Guidance
function getPhaseDetails(phase: string | null | undefined) {
  switch (phase?.toUpperCase()) {
    case "MENSTRUAL":
      return {
        name: "Menstrual Phase",
        color: "from-rose-500 to-pink-600",
        badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
        accent: "text-rose-600",
        icon: "🩸",
        tagline: "Rest, Replenish & Gentle Movement",
        description:
          "Estrogen and progesterone are at their baseline. Your body is shedding the uterine lining.",
        tips: [
          "Focus on iron & magnesium rich foods (spinach, dark chocolate, lentils).",
          "Hydrate well with warm herbal teas (chamomile, ginger, raspberry leaf).",
          "Prioritize gentle stretching, restorative yoga, and restorative rest.",
        ],
      };
    case "FOLLICULAR":
      return {
        name: "Follicular Phase",
        color: "from-purple-500 to-indigo-600",
        badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
        accent: "text-purple-600",
        icon: "🌱",
        tagline: "Rising Energy & High Neuroplasticity",
        description:
          "Estrogen is rising, stimulating follicular growth. Energy and cognitive focus are on an upward trend.",
        tips: [
          "Great time for high-intensity training, creative brainstorming, and new projects.",
          "Incorporate fermented foods, fresh veggies, and lean proteins.",
          "Natural estrogen surge supports skin glow and elevated mood.",
        ],
      };
    case "OVULATION":
      return {
        name: "Ovulation Phase",
        color: "from-amber-500 to-pink-500",
        badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
        accent: "text-amber-600",
        icon: "✨",
        tagline: "Peak Fertility & Maximum Vitality",
        description:
          "Luteinizing hormone (LH) and estrogen peak, triggering egg release. Peak confidence and social stamina.",
        tips: [
          "Peak energy window: ideal for presentations, public speaking, and tough workouts.",
          "Eat glutathione-rich foods (broccoli, avocado, asparagus) to support liver metabolism of estrogen.",
          "Track body temperature or cervical changes for fertility accuracy.",
        ],
      };
    case "LUTEAL":
      return {
        name: "Luteal Phase",
        color: "from-pink-600 to-rose-700",
        badgeBg: "bg-pink-100 text-pink-800 border-pink-200",
        accent: "text-pink-600",
        icon: "🌙",
        tagline: "Nesting, Metabolic Shift & Calm Focus",
        description:
          "Progesterone is the dominant hormone. Basal metabolic rate increases slightly; body prepares for rest.",
        tips: [
          "Increase complex carbs (sweet potatoes, oats) to stabilize serotonin and mood.",
          "Incorporate magnesium and B-complex vitamins to alleviate PMS sensations.",
          "Transition to moderate exercise like pilates, walking, and strength sessions.",
        ],
      };
    default:
      return {
        name: "Cycle In Sync",
        color: "from-pink-500 to-purple-600",
        badgeBg: "bg-pink-100 text-pink-800 border-pink-200",
        accent: "text-pink-600",
        icon: "🌸",
        tagline: "Personalized Cycle Intelligence",
        description:
          "Log your cycles regularly to unlock predictive phase forecasting, symptom correlations, and wellness plans.",
        tips: [
          "Log today's symptoms and mood to improve machine predictions.",
          "Maintain balanced hydration throughout your daily routine.",
          "Check in with Herizon AI for personalized wellness queries.",
        ],
      };
  }
}

// Calculate cycle day & progress
function calculateCycleProgress(
  startDate: Date | null | undefined,
  averageLength: number = 28,
) {
  if (!startDate)
    return {
      day: 1,
      total: averageLength,
      progressPct: 0,
      daysLeft: averageLength,
    };

  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const currentCycleDay =
    diffDays > 0
      ? diffDays % averageLength === 0
        ? averageLength
        : diffDays % averageLength
      : 1;
  const progressPct = Math.min(
    100,
    Math.round((currentCycleDay / averageLength) * 100),
  );
  const daysLeft = Math.max(0, averageLength - currentCycleDay);

  return { day: currentCycleDay, total: averageLength, progressPct, daysLeft };
}

// Format date helper
function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Not recorded";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role === "PARTNER") {
    redirect("/partner/dashboard");
  }

  const userId = session.user.id;

  const [
    healthProfile,
    latestCycle,
    recentCycles,
    symptomChecks,
    chatSessions,
    articles,
  ] = await Promise.all([
    prisma.healthProfile.findUnique({
      where: { userId },
    }),

    prisma.cycle.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" },
    }),

    prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      take: 4,
    }),

    prisma.symptomCheck.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        symptoms: {
          include: {
            symptom: true,
          },
        },
      },
    }),

    prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    }),

    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      take: 3,
      include: {
        category: true,
      },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  if (!healthProfile) {
    redirect("/onboarding");
  }

  // Calculate BMI
  const heightM = healthProfile.heightCm / 100;
  const bmi = (healthProfile.weightKg / (heightM * heightM)).toFixed(1);
  const bmiNumber = parseFloat(bmi);
  let bmiCategory = "Normal Weight";
  let bmiColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (bmiNumber < 18.5) {
    bmiCategory = "Underweight";
    bmiColor = "text-amber-600 bg-amber-50 border-amber-200";
  } else if (bmiNumber >= 25 && bmiNumber < 30) {
    bmiCategory = "Overweight";
    bmiColor = "text-amber-600 bg-amber-50 border-amber-200";
  } else if (bmiNumber >= 30) {
    bmiCategory = "Obese";
    bmiColor = "text-rose-600 bg-rose-50 border-rose-200";
  }

  // Phase & Cycle details
  const currentPhase = latestCycle?.phase || "UNKNOWN";
  const phaseInfo = getPhaseDetails(currentPhase);
  const cycleLength = healthProfile.averageCycleLength || 28;
  const cycleProgress = calculateCycleProgress(
    latestCycle?.startDate,
    cycleLength,
  );

  // Time of day greeting
  const hour = new Date().getHours();
  let timeGreeting = "Good morning";
  if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
  if (hour >= 17) timeGreeting = "Good evening";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      {/* Universal Top Navigation */}
      <Navbar userName={session.user.name} userEmail={session.user.email} />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Hero Welcome & Quick Action Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600 via-rose-500 to-purple-700 text-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-pink-900/10">
          {/* Ambient decorative glowing circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {phaseInfo.name} &bull; Day {cycleProgress.day} of{" "}
                {cycleProgress.total}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {timeGreeting}, {session.user.name?.split(" ")[0] || "Friend"}!
                ✨
              </h1>

              <p className="text-white/90 text-sm sm:text-base max-w-xl leading-relaxed">
                {phaseInfo.tagline}. Today is a wonderful day to tune into your
                body and practice personalized self-care.
              </p>
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/period"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-pink-700 hover:bg-pink-50 font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <span>🌸</span>
                <span>Log Cycle</span>
              </Link>

              <Link
                href="/symptoms"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs sm:text-sm border border-white/25 transition-all active:scale-95"
              >
                <span>🩺</span>
                <span>Check Symptoms</span>
              </Link>

              <Link
                href="/ai"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs sm:text-sm border border-white/25 transition-all active:scale-95"
              >
                <span>💬</span>
                <span>Ask AI</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Key Metrics Overview Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Cycle Phase */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border border-pink-100/60 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Current Phase
              </span>
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {phaseInfo.icon}
              </span>
            </div>
            <p className="mt-3 text-xl sm:text-2xl font-extrabold text-gray-900 line-clamp-1">
              {phaseInfo.name}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">Day {cycleProgress.day}</span>
              <span className="font-semibold text-pink-600">
                {latestCycle?.predictedNextPeriod
                  ? `Next in ${cycleProgress.daysLeft}d`
                  : "Active"}
              </span>
            </div>
          </div>

          {/* Card 2: Health Profile & BMI */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border border-pink-100/60 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                BMI &amp; Vitals
              </span>
              <span className="text-2xl group-hover:scale-110 transition-transform">
                ⚖️
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {bmi}
              </span>
              <span className="text-xs text-gray-500">BMI</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {healthProfile.weightKg}kg &bull; {healthProfile.heightCm}cm
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${bmiColor}`}
              >
                {bmiCategory}
              </span>
            </div>
          </div>

          {/* Card 3: Symptom Intelligence */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border border-pink-100/60 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Symptom Checks
              </span>
              <span className="text-2xl group-hover:scale-110 transition-transform">
                🩺
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {symptomChecks.length}
              </span>
              <span className="text-xs text-gray-500">Logs Recorded</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">Latest Urgency:</span>
              <span className="font-semibold text-purple-600">
                {symptomChecks[0]?.urgencyLevel || "Normal"}
              </span>
            </div>
          </div>

          {/* Card 4: Herizon AI Consultations */}
          <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-xs border border-pink-100/60 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                AI Companion
              </span>
              <span className="text-2xl group-hover:scale-110 transition-transform">
                🤖
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {chatSessions.length}
              </span>
              <span className="text-xs text-gray-500">Consultations</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">24/7 Companion</span>
              <Link
                href="/ai"
                className="font-semibold text-pink-600 hover:underline"
              >
                Start Chat →
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Main Dashboard Interactive Split: Cycle Visualizer & Phase Care */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cycle Visualizer & Predictions (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Cycle Status Card */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Cycle &amp; Ovulation Forecast
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Continuous monitoring based on your physiological rhythm.
                  </p>
                </div>
                <Link
                  href="/period"
                  className="text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline"
                >
                  View Calendar →
                </Link>
              </div>

              {/* Progress Bar & Day Indicator */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-gray-800">
                    Day {cycleProgress.day} of {cycleProgress.total}
                  </span>
                  <span className="text-pink-600">
                    {cycleProgress.progressPct}% Complete
                  </span>
                </div>

                {/* Styled Progress Bar */}
                <div className="w-full h-3.5 bg-pink-50 rounded-full overflow-hidden p-0.5 border border-pink-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 transition-all duration-500"
                    style={{
                      width: `${Math.max(5, cycleProgress.progressPct)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-gray-400 font-medium pt-1">
                  <span>Period (Days 1-5)</span>
                  <span>Ovulation (~Day 14)</span>
                  <span>Luteal (~Days 15-28)</span>
                </div>
              </div>

              {/* Cycle Prediction Metrics */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100/60">
                  <span className="text-xs text-gray-500 font-medium block">
                    Predicted Next Period
                  </span>
                  <p className="mt-1 text-base font-bold text-pink-900">
                    {latestCycle?.predictedNextPeriod
                      ? formatDate(latestCycle.predictedNextPeriod)
                      : "Record cycle for prediction"}
                  </p>
                  <p className="text-[11px] text-pink-600 mt-1">
                    {latestCycle?.predictedNextPeriod
                      ? `Estimated in ${cycleProgress.daysLeft} days`
                      : "Tap 'Log Cycle' to predict"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60">
                  <span className="text-xs text-gray-500 font-medium block">
                    Estimated Fertile Window
                  </span>
                  <p className="mt-1 text-base font-bold text-purple-900">
                    {latestCycle?.fertileStart && latestCycle?.fertileEnd
                      ? `${formatDate(latestCycle.fertileStart)} – ${formatDate(latestCycle.fertileEnd)}`
                      : "Prediction Pending"}
                  </p>
                  <p className="text-[11px] text-purple-600 mt-1">
                    {latestCycle?.predictedOvulation
                      ? `Ovulation approx: ${formatDate(latestCycle.predictedOvulation)}`
                      : "Calculated via rhythm algorithm"}
                  </p>
                </div>
              </div>

              {/* Mood & Notes logged */}
              {latestCycle?.mood && (
                <div className="mt-5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    Logged Mood:
                  </span>
                  <span className="font-semibold text-gray-800 bg-white px-3 py-1 rounded-xl shadow-xs">
                    {latestCycle.mood}
                  </span>
                </div>
              )}
            </div>

            {/* Cycle History Table Preview */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                  Recent Cycle Records
                </h3>
                <Link
                  href="/period"
                  className="text-xs font-semibold text-pink-600 hover:underline"
                >
                  Log New +
                </Link>
              </div>

              {recentCycles.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  <p>No cycle history recorded yet.</p>
                  <Link
                    href="/period"
                    className="inline-block mt-2 font-semibold text-pink-600 hover:underline"
                  >
                    Record your first period →
                  </Link>
                </div>
              ) : (
                <div className="mt-4 divide-y divide-gray-100">
                  {recentCycles.map((cycle) => (
                    <div
                      key={cycle.id}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatDate(cycle.startDate)}
                          {cycle.endDate
                            ? ` → ${formatDate(cycle.endDate)}`
                            : " (Ongoing)"}
                        </p>
                        <p className="text-gray-400 text-[11px] mt-0.5">
                          Phase: {cycle.phase}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 font-semibold text-[11px]">
                          {cycle.periodLength
                            ? `${cycle.periodLength} days`
                            : "Active"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Daily Hormone Advice & AI / Symptom Shortcuts (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Phase Guidance & Wellness Tips Card */}
            <div className="rounded-3xl bg-gradient-to-br from-white to-pink-50/40 p-6 sm:p-8 shadow-xs border border-pink-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-pink-100 text-pink-600 text-lg">
                  {phaseInfo.icon}
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Phase Care Blueprint
                  </h3>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${phaseInfo.badgeBg}`}
                  >
                    {phaseInfo.name}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-600 leading-relaxed">
                {phaseInfo.description}
              </p>

              <div className="mt-4 space-y-2.5">
                {phaseInfo.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-pink-100/80 shadow-xs text-xs text-gray-700"
                  >
                    <span className="text-pink-500 font-bold shrink-0">✦</span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Symptom Checker Quick Action Card */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🩺</span>
                  <h3 className="text-base font-bold text-gray-900">
                    Symptom Triage
                  </h3>
                </div>
                <Link
                  href="/symptoms"
                  className="text-xs font-semibold text-purple-600 hover:underline"
                >
                  New Check +
                </Link>
              </div>

              {symptomChecks.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {symptomChecks.map((check) => (
                    <div
                      key={check.id}
                      className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-gray-900">
                          {formatDate(check.createdAt)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px]">
                          {check.urgencyLevel || "Low"}
                        </span>
                      </div>

                      {check.recommendation && (
                        <p className="text-gray-600 mt-1.5 text-[11px] leading-relaxed line-clamp-2">
                          {check.recommendation}
                        </p>
                      )}

                      {check.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {check.symptoms.map((s) => (
                            <span
                              key={s.symptom.id}
                              className="px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-[10px] text-gray-600 font-medium"
                            >
                              {s.symptom.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-500">
                  <p>No symptoms logged yet.</p>
                  <Link
                    href="/symptoms"
                    className="inline-block mt-1.5 font-semibold text-pink-600 hover:underline"
                  >
                    Perform your first symptom check →
                  </Link>
                </div>
              )}
            </div>

            {/* Herizon AI Prompt Starter Card */}
            {/* <div className="rounded-3xl bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6 shadow-md">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-white/20 text-sm">🤖</span>
                <h3 className="text-sm font-bold">Herizon AI Assistant</h3>
              </div>
              <p className="text-white/80 text-xs mt-2 leading-relaxed">
                Need immediate answers about your cycle, hormonal balance, or
                PCOS nutrition?
              </p>

              <div className="mt-4 space-y-2">
                <Link
                  href="/ai"
                  className="block p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white/90 transition border border-white/10"
                >
                  &ldquo;What are the best foods for the luteal phase?&rdquo; →
                </Link>
                <Link
                  href="/ai"
                  className="block p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white/90 transition border border-white/10"
                >
                  &ldquo;How to naturally soothe menstrual cramps?&rdquo; →
                </Link>
              </div>

              <Link
                href="/ai"
                className="mt-4 w-full block text-center py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 font-semibold text-xs transition"
              >
                Open Herizon AI Chat
              </Link>
            </div> */}
          </div>
        </section>

        {/* 4. Health Profile & Emergency Overview */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Medical &amp; Emergency Profile
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Your critical medical reference details.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span>Edit Profile</span>
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block text-[11px]">
                Blood Group
              </span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                {healthProfile.bloodGroup || "Not specified"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block text-[11px]">Allergies</span>
              <span className="font-semibold text-gray-800 mt-0.5 block truncate">
                {healthProfile.allergies || "None declared"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block text-[11px]">
                Medical Notes
              </span>
              <span className="font-semibold text-gray-800 mt-0.5 block truncate">
                {healthProfile.medicalConditions || "None recorded"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="text-rose-600 font-semibold block text-[11px]">
                Emergency Contact
              </span>
              <span className="font-bold text-gray-900 mt-0.5 block truncate">
                {healthProfile.emergencyContactName || "Not set"}
              </span>
              {healthProfile.emergencyContactPhone && (
                <a
                  href={`tel:${healthProfile.emergencyContactPhone}`}
                  className="text-pink-600 font-medium hover:underline text-[11px] mt-0.5 block"
                >
                  📞 {healthProfile.emergencyContactPhone}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* 5. Educational Article Spotlight (if articles available) */}
        {articles.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Recommended Health Reads
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Medically reviewed wellness &amp; cycle education.
                </p>
              </div>
              <Link
                href="/resources"
                className="text-xs font-semibold text-pink-600 hover:underline"
              >
                Explore All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/resources/${article.slug}`}
                  className="rounded-3xl bg-white p-5 border border-pink-100/60 shadow-xs hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div>
                    <span className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold tracking-wide uppercase">
                      {article.category.name}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-2.5 group-hover:text-pink-600 transition line-clamp-2">
                      {article.title}
                    </h4>
                    {article.summary && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>5 min read</span>
                    <span className="text-pink-600 font-semibold group-hover:translate-x-1 transition-transform">
                      Read Article →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Universal Bottom Footer */}
      <Footer />
    </div>
  );
}
