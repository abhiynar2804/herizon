import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalPartners,
      totalAdmins,
      totalConnections,
      totalSymptomChecks,
      totalCycles,
      totalSymptoms,
      activeSymptoms,
      totalRules,
      activeRules,
      totalArticles,
      publishedArticles,
      auditLogsCount,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          isActive: true,
        },
      }),

      prisma.user.count({
        where: {
          isActive: false,
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

      prisma.symptomCheck.count(),

      prisma.cycle.count(),

      prisma.symptom.count(),

      prisma.symptom.count({
        where: {
          isActive: true,
        },
      }),

      prisma.symptomRule.count(),

      prisma.symptomRule.count({
        where: {
          isActive: true,
        },
      }),

      prisma.article.count(),

      prisma.article.count({
        where: {
          status: "PUBLISHED",
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

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalPartners,
        totalAdmins,
        totalConnections,
        totalSymptomChecks,
        totalCycles,
        totalSymptoms,
        activeSymptoms,
        totalSymptomRules: totalRules,
        activeSymptomRules: activeRules,
        totalArticles,
        publishedArticles,
        auditLogsCount,
      },

      recentAuditLogs,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);

    return NextResponse.json(
      { message: "Failed to fetch admin dashboard." },
      { status: 500 }
    );
  }
}