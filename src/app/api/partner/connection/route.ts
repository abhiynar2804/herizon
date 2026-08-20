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

    const userId = session.user.id;

    const connection = await prisma.partnerConnection.findFirst({
      where: {
        OR: [
          { inviterUserId: userId },
          { inviteeUserId: userId },
        ],
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
            role: true,
          },
        },
        invitee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        sharingSetting: true,
      },
    });

    if (!connection) {
      return NextResponse.json({
        connected: false,
        connection: null,
      });
    }

    const isInviter = connection.inviterUserId === userId;

    const partner = isInviter
      ? connection.invitee
      : connection.inviter;

    return NextResponse.json({
      connected: connection.status === "ACCEPTED",
      connection: {
        id: connection.id,
        status: connection.status,
        invitedAt: connection.invitedAt,
        acceptedAt: connection.acceptedAt,
        disconnectedAt: connection.disconnectedAt,
      },
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        role: partner.role,
      },
      sharingSetting:
        connection.status === "ACCEPTED"
          ? connection.sharingSetting
          : null,
    });
  } catch (error) {
    console.error(
      "GET /api/partner/connection error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to fetch partner connection." },
      { status: 500 },
    );
  }
}