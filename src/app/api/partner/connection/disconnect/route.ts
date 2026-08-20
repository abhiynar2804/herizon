import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const connection = await prisma.partnerConnection.findFirst({
      where: {
        OR: [
          { inviterUserId: session.user.id },
          { inviteeUserId: session.user.id },
        ],
        status: "ACCEPTED",
      },
    });

    if (!connection) {
      return NextResponse.json(
        { message: "No active partner connection found." },
        { status: 404 },
      );
    }

    await prisma.partnerConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        status: "DISCONNECTED",
        disconnectedAt: new Date(),
      },
    });

    await prisma.notification.createMany({
  data: [
    {
      userId: connection.inviterUserId,
      title: "Partner Disconnected",
      message: "Your partner connection has been disconnected.",
      type: "PARTNER_INVITE",
      channel: "IN_APP",
      status: "PENDING",
    },
    {
      userId: connection.inviteeUserId,
      title: "Partner Disconnected",
      message: "Your partner connection has been disconnected.",
      type: "PARTNER_INVITE",
      channel: "IN_APP",
      status: "PENDING",
    },
  ],
});

    return NextResponse.json({
      message: "Partner connection disconnected successfully.",
    });
  } catch (error) {
    console.error(
      "POST /api/partner/connection/disconnect error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to disconnect partner." },
      { status: 500 },
    );
  }
}