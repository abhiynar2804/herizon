import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PARTNER") {
      return NextResponse.json(
        { error: "Only partner accounts can accept invitations." },
        { status: 403 },
      );
    }

    const { token } = await params;

    const connection = await prisma.partnerConnection.findUnique({
      where: {
        inviteToken: token,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Partner invitation not found." },
        { status: 404 },
      );
    }

    if (connection.inviteeUserId !== session.user.id) {
      return NextResponse.json(
        { error: "This invitation does not belong to your account." },
        { status: 403 },
      );
    }

    if (connection.status !== "PENDING") {
      return NextResponse.json(
        { error: "This invitation is no longer pending." },
        { status: 409 },
      );
    }

    // A5: one active partner connection per user.
    const existingActiveConnection = await prisma.partnerConnection.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { inviterUserId: connection.inviterUserId },
          { inviteeUserId: connection.inviterUserId },
          { inviterUserId: connection.inviteeUserId },
          { inviteeUserId: connection.inviteeUserId },
        ],
      },
    });

    if (existingActiveConnection) {
      return NextResponse.json(
        {
          error: "One of these users already has an active partner connection.",
        },
        { status: 409 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.partnerConnection.update({
        where: {
          id: connection.id,
        },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          disconnectedAt: null,
        },
      });

      // Reuse existing sharing settings if this connection
      // was previously accepted.
      await tx.partnerSharingSetting.upsert({
        where: {
          connectionId: connection.id,
        },
        update: {},
        create: {
          connectionId: connection.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: connection.inviterUserId,
          type: "SYSTEM",
          title: "Partner Invitation Accepted",
          message: `${session.user.name || "Your partner"} accepted your partner invitation.`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Partner invitation accepted successfully.",
    });
  } catch (error) {
    console.error("Partner invitation accept error:", error);

    return NextResponse.json(
      { error: "Failed to accept partner invitation." },
      { status: 500 },
    );
  }
}
