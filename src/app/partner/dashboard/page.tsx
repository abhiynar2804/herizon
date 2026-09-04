import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PendingInviteCard from "@/components/partner/PendingInviteCard";

// Helper for partner care tips based on cycle phase
function getPartnerPhaseCare(phase?: string | null) {
  switch (phase?.toUpperCase()) {
    case "MENSTRUAL":
      return {
        name: "Menstrual Phase",
        badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
        icon: "🩸",
        partnerAdvice:
          "Energy levels may be lower during this phase. Be patient, supportive, and offer comfort.",
        actions: [
          "Offer a hot water bottle or heating pad to ease cramps.",
          "Prepare warm, iron-rich meals or comforting herbal tea.",
          "Give space for gentle rest without pressure.",
        ],
      };
    case "FOLLICULAR":
      return {
        name: "Follicular Phase",
        badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
        icon: "🌱",
        partnerAdvice:
          "Estrogen is rising! Energy, focus, and optimism are on an upward trend.",
        actions: [
          "Great time to plan fun dates, workouts, or outdoor activities together.",
          "Brainstorm new projects or travel plans.",
          "Enjoy active social time together.",
        ],
      };
    case "OVULATION":
      return {
        name: "Ovulation Phase",
        badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
        icon: "✨",
        partnerAdvice:
          "Peak energy, high social confidence, and maximum vitality.",
        actions: [
          "Plan a special evening or social outing.",
          "Offer positive encouragement and celebrate recent accomplishments.",
          "Enjoy high-energy shared hobbies.",
        ],
      };
    case "LUTEAL":
      return {
        name: "Luteal Phase",
        badgeBg: "bg-pink-100 text-pink-800 border-pink-200",
        icon: "🌙",
        partnerAdvice:
          "Hormonal shifts can cause fatigue or sensitivity as body prepares for rest.",
        actions: [
          "Help out with extra household chores to lighten the daily load.",
          "Keep comforting complex carbs and healthy snacks accessible.",
          "Offer cozy, low-stress evenings at home.",
        ],
      };
    default:
      return {
        name: "Active Support",
        badgeBg: "bg-pink-100 text-pink-800 border-pink-200",
        icon: "🌸",
        partnerAdvice:
          "Check in regularly with your partner and practice thoughtful everyday care.",
        actions: [
          "Ask how they are feeling today.",
          "Ensure fresh water and healthy snacks are nearby.",
          "Offer a listening ear.",
        ],
      };
  }
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Not shared";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PartnerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "PARTNER") {
    redirect("/dashboard");
  }

  // Fetch connection & settings
  const connection = await prisma.partnerConnection.findFirst({
    where: {
      inviteeUserId: session.user.id,
      status: "ACCEPTED",
    },
    include: {
      inviter: {
        select: {
          id: true,
          name: true,
        },
      },
      sharingSetting: true,
    },
  });

  if (!connection || !connection.sharingSetting) {
    // Check if there is a PENDING invitation for this partner account
    const pendingConnection = await prisma.partnerConnection.findFirst({
      where: {
        inviteeUserId: session.user.id,
        status: "PENDING",
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return (
      <div className="min-h-screen flex flex-col bg-gray-50/70">
        <Navbar userName={session.user.name} userEmail={session.user.email} />
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12 flex items-center justify-center">
          {pendingConnection ? (
            <PendingInviteCard
              inviterName={pendingConnection.inviter.name}
              inviterEmail={pendingConnection.inviter.email}
              inviteToken={pendingConnection.inviteToken}
              invitedAt={pendingConnection.invitedAt}
            />
          ) : (
            <div className="rounded-3xl bg-white p-8 text-center border border-pink-100/60 shadow-xs space-y-3 w-full">
              <span className="text-3xl block">❤️</span>
              <h1 className="text-lg font-bold text-gray-900">
                No Active Connection Found
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed">
                When your partner sends an invitation from their Herizon Partner Sync page to your registered email (<strong className="text-gray-700">{session.user.email}</strong>), your invitation will appear right here for you to accept.
              </p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  const settings = connection.sharingSetting;

  // Fetch inviter's cycle data
  const inviterUser = await prisma.user.findUnique({
    where: { id: connection.inviterUserId },
    include: {
      cycles: {
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });

  const partnerName = connection.inviter.name;
  const latestCycle = inviterUser?.cycles[0];
  const phaseCare = getPartnerPhaseCare(latestCycle?.phase);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70">
      <Navbar userName={session.user.name} userEmail={session.user.email} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Partner Header Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600 via-rose-500 to-purple-700 text-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-pink-900/10">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Partner Support Hub
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Supporting {partnerName} ✨
            </h1>

            <p className="text-white/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              Welcome to your shared partner dashboard. Below is the supportive information {partnerName} has chosen to share with you.
            </p>
          </div>
        </section>

        {/* Strict Privacy Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-white border border-pink-100/80 shadow-xs flex items-start gap-3 text-xs text-gray-600">
          <span className="p-1.5 rounded-xl bg-pink-50 text-pink-600 text-base shrink-0">
            🔒
          </span>
          <div>
            <span className="font-bold text-gray-900 block">
              Herizon Privacy Lock Active
            </span>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              Medical records, AI chat history, private notes, and sensitive health logs are strictly confidential to {partnerName} and are never displayed here.
            </p>
          </div>
        </div>

        {/* Shared Information Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Shared Cycle Phase */}
          {settings.shareCyclePhase ? (
            <div className="rounded-3xl bg-white p-6 shadow-xs border border-pink-100/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Current Phase
                </span>
                <span className="text-2xl">{phaseCare.icon}</span>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">
                {phaseCare.name}
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                {phaseCare.partnerAdvice}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-gray-50/80 p-6 border border-gray-200/60 text-xs text-gray-400 flex items-center justify-center text-center">
              <span>Cycle phase sharing is turned off by {partnerName}.</span>
            </div>
          )}

          {/* Card 2: Shared Next Predicted Period */}
          {settings.shareNextPeriod ? (
            <div className="rounded-3xl bg-white p-6 shadow-xs border border-pink-100/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-600">
                  Next Period Window
                </span>
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-xl font-extrabold text-gray-900">
                {formatDate(latestCycle?.predictedNextPeriod)}
              </p>
              <p className="text-xs text-gray-500">
                Keep this timeframe in mind so you can offer extra care &amp; understanding.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-gray-50/80 p-6 border border-gray-200/60 text-xs text-gray-400 flex items-center justify-center text-center">
              <span>Period date sharing is turned off by {partnerName}.</span>
            </div>
          )}

          {/* Card 3: Shared Mood */}
          {settings.shareMood ? (
            <div className="rounded-3xl bg-white p-6 shadow-xs border border-pink-100/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Shared Feeling / Mood
                </span>
                <span className="text-2xl">😊</span>
              </div>
              <p className="text-base font-bold text-gray-900">
                {latestCycle?.mood || "No specific mood shared today"}
              </p>
              <p className="text-xs text-gray-500">
                Updated directly from {partnerName}&apos;s period tracker check-in.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-gray-50/80 p-6 border border-gray-200/60 text-xs text-gray-400 flex items-center justify-center text-center">
              <span>Mood sharing is turned off by {partnerName}.</span>
            </div>
          )}
        </section>

        {/* Actionable Partner Support Suggestions */}
        {settings.shareCareSuggestions && (
          <section className="rounded-3xl bg-gradient-to-br from-pink-50/60 to-purple-50/60 p-6 sm:p-8 shadow-xs border border-pink-100 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Support Tips for {partnerName}&apos;s {phaseCare.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Thoughtful ways you can show care and make their day easier.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {phaseCare.actions.map((action, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-white border border-pink-100/80 shadow-xs text-xs text-gray-700 space-y-1"
                >
                  <span className="text-pink-600 font-bold">Tip #{index + 1}</span>
                  <p className="leading-relaxed font-medium">{action}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
