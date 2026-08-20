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
        { status: 401 },
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 },
      );
    }

    const logs = await prisma.adminAuditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error(
      "GET /api/admin/audit-logs error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to fetch audit logs." },
      { status: 500 },
    );
  }
}