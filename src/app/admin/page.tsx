import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNavbar from "@/components/layout/AdminNavbar";

async function getAdminDashboardData() {
  const [
    totalUsers,
    activeUsers,
    totalCycles,
    totalSymptomChecks,
    totalArticles,
    publishedArticles,
    totalSymptomRules,
    activeSymptomRules,
    totalPartners,
    totalAdmins,
    totalConnections,
    totalSymptoms,
    activeSymptoms,
    auditLogsCount,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        isActive: true,
      },
    }),

    prisma.cycle.count(),

    prisma.symptomCheck.count(),

    prisma.article.count(),

    prisma.article.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    prisma.symptomRule.count(),

    prisma.symptomRule.count({
      where: {
        isActive: true,
      },
    }),

    prisma.user.count({
      where: {
        role: "PARTNER",
      },
    }),

    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),

    prisma.partnerConnection.count({
      where: {
        status: "ACCEPTED",
      },
    }),

    prisma.symptom.count(),

    prisma.symptom.count({
      where: {
        isActive: true,
      },
    }),

    prisma.adminAuditLog.count(),

    prisma.adminAuditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        details: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    stats: {
      totalUsers,
      activeUsers,
      totalCycles,
      totalSymptomChecks,
      totalArticles,
      publishedArticles,
      totalSymptomRules,
      activeSymptomRules,
      totalPartners,
      totalAdmins,
      totalConnections,
      totalSymptoms,
      activeSymptoms,
      auditLogsCount,
    },
    recentAuditLogs,
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const data = await getAdminDashboardData();
  const stats = data.stats;
  const auditLogs = data.recentAuditLogs;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
            🛡️ Platform Administration Hub
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Overview &amp; Analytics
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm">
            Monitor accounts, symptoms rule engines, educational articles, and
            system activity logs.
          </p>
        </header>

        {/* Core Stats Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-3xl bg-slate-900/80 p-5 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Accounts
            </span>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">
                {stats.totalUsers}
              </span>

              <span className="text-xs text-emerald-400 font-medium">
                {stats.activeUsers} Active
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/80 p-5 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cycles Recorded
            </span>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">
                {stats.totalCycles}
              </span>

              <span className="text-xs text-purple-400 font-medium">
                Active Tracking
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/80 p-5 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Symptom Rules
            </span>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">
                {stats.totalSymptomRules}
              </span>

              <span className="text-xs text-amber-400 font-medium">
                {stats.totalSymptomChecks} Checks
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/80 p-5 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Articles &amp; Reads
            </span>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">
                {stats.totalArticles}
              </span>

              <span className="text-xs text-indigo-400 font-medium">
                {stats.publishedArticles} Published
              </span>
            </div>
          </div>
        </section>

        {/* Additional Platform Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Partners
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {stats.totalPartners}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Admins
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {stats.totalAdmins}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Connections
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {stats.totalConnections}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Symptoms
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {stats.totalSymptoms}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Active Symptoms
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {stats.activeSymptoms}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Audit Logs
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {stats.auditLogsCount}
            </p>
          </div>
        </section>

        {/* Quick Management Shortcuts */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/admin/users"
            className="p-6 rounded-3xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition group space-y-3"
          >
            <span className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 inline-block text-xl">
              👥
            </span>

            <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition">
              User Management
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              View registered users, manage roles, and toggle active status.
            </p>
          </Link>

          <Link
            href="/admin/symptoms"
            className="p-6 rounded-3xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition group space-y-3"
          >
            <span className="p-3 rounded-2xl bg-pink-500/10 text-pink-400 inline-block text-xl">
              🩺
            </span>

            <h3 className="text-base font-bold text-white group-hover:text-pink-400 transition">
              Symptoms &amp; Rules Engine
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Create symptom entries, define multi-symptom rules, emergency
              flags, and recommendations.
            </p>
          </Link>

          <Link
            href="/admin/articles"
            className="p-6 rounded-3xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition group space-y-3"
          >
            <span className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 inline-block text-xl">
              📚
            </span>

            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
              Educational Articles
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Manage categories, draft health content, and publish educational
              reads for users.
            </p>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="p-6 rounded-3xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition group space-y-3"
          >
            <span className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 inline-block text-xl">
              📜
            </span>

            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
              Audit Activity Logs
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Review platform administrative actions, security timestamps, and
              actor trails.
            </p>
          </Link>
        </section>

        {/* Audit Feed */}
        <section className="rounded-3xl bg-slate-900/80 p-6 sm:p-8 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">
              Recent Administrative Activity
            </h2>

            <Link
              href="/admin/audit-logs"
              className="text-xs font-semibold text-purple-400 hover:underline"
            >
              View All Logs &rarr;
            </Link>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No audit activities recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-800 text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-purple-300 mr-2">
                      [{log.action}]
                    </span>

                    <span className="text-slate-300">
                      {log.details || log.targetType}
                    </span>
                  </div>

                  <span className="text-slate-500 text-[11px] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}