import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [healthProfile, latestCycle, symptomChecks, chatSessions] =
    await Promise.all([
      prisma.healthProfile.findUnique({
        where: {
          userId,
        },
      }),

      prisma.cycle.findFirst({
        where: {
          userId,
        },
        orderBy: {
          startDate: "desc",
        },
      }),

      prisma.symptomCheck.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
        select: {
          id: true,
          recommendation: true,
          urgencyLevel: true,
          createdAt: true,
        },
      }),

      prisma.chatSession.findMany({
        where: {
          userId,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 3,
        select: {
          id: true,
          title: true,
          updatedAt: true,
        },
      }),
    ]);

  if (!healthProfile) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <DashboardNav />
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm font-medium text-pink-600">
            Welcome back
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            {session.user.name}
          </h1>

          <p className="mt-2 text-gray-500">
            Your personal Herizon health overview.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Health Profile"
            value="Complete"
          />

          <DashboardCard
            title="Latest Cycle"
            value={
              latestCycle
                ? latestCycle.phase
                : "No data"
            }
          />

          <DashboardCard
            title="Symptom Checks"
            value={String(symptomChecks.length)}
          />

          <DashboardCard
            title="AI Conversations"
            value={String(chatSessions.length)}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Latest Cycle
            </h2>

            {latestCycle ? (
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>
                  Start date:{" "}
                  {latestCycle.startDate.toLocaleDateString()}
                </p>

                <p>
                  Predicted next period:{" "}
                  {latestCycle.predictedNextPeriod
                    ? latestCycle.predictedNextPeriod.toLocaleDateString()
                    : "Not available"}
                </p>

                <p>
                  Current phase:{" "}
                  {latestCycle.phase}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                No cycle has been recorded yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Symptom Checks
            </h2>

            {symptomChecks.length > 0 ? (
              <div className="mt-4 space-y-3">
                {symptomChecks.map((check) => (
                  <div
                    key={check.id}
                    className="rounded-xl bg-gray-50 p-3"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {check.urgencyLevel ?? "No urgency level"}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {check.recommendation ??
                        "No recommendation available."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                No symptom checks yet.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent AI Conversations
          </h2>

          {chatSessions.length > 0 ? (
            <div className="mt-4 space-y-3">
              {chatSessions.map((chat) => (
                <div
                  key={chat.id}
                  className="rounded-xl bg-gray-50 p-3"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {chat.title || "New Conversation"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Updated{" "}
                    {chat.updatedAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No AI conversations yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}