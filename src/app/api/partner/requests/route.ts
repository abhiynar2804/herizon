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

    if (session.user.role !== "PARTNER") {
      return NextResponse.json(
        { message: "Only partner users can access partner requests." },
        { status: 403 }
      );
    }

    const requests = await prisma.partnerConnection.findMany({
      where: {
        inviteeUserId: session.user.id,
        status: "PENDING",
      },
      orderBy: {
        invitedAt: "desc",
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

    return NextResponse.json({
      requests: requests.map((request) => ({
        id: request.id,
        inviteToken: request.inviteToken,
        invitedAt: request.invitedAt,
        inviter: request.inviter,
      })),
    });
  } catch (error) {
    console.error("GET /api/partner/requests error:", error);

    return NextResponse.json(
      { message: "Failed to fetch partner requests." },
      { status: 500 }
    );
  }
}