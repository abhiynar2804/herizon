import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (session.user.role !== "PARTNER") {
      return NextResponse.json(
        { message: "Only partner users can accept invitations." },
        { status: 403 },
      );
    }

    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { message: "Invalid invitation token." },
        { status: 400 },
      );
    }

    const connection = await prisma.partnerConnection.findUnique({
      where: {
        inviteToken: token,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { message: "Invitation not found." },
        { status: 404 },
      );
    }

    if (connection.inviteeUserId !== session.user.id) {
      return NextResponse.json(
        { message: "You are not authorized to accept this invitation." },
        { status: 403 },
      );
    }

    if (connection.status !== "PENDING") {
      return NextResponse.json(
        { message: "This invitation is no longer pending." },
        { status: 409 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedConnection =
        await tx.partnerConnection.update({
          where: {
            id: connection.id,
          },
          data: {
            status: "ACCEPTED",
            acceptedAt: new Date(),
          },
          select: {
            id: true,
            status: true,
            acceptedAt: true,
          },
        });

      await tx.partnerSharingSetting.create({
        data: {
          connectionId: connection.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: connection.inviterUserId,
          title: "Partner Invitation Accepted",
          message: "Your partner invitation has been accepted.",
          type: "PARTNER_INVITE",
          channel: "IN_APP",
          status: "PENDING",
        },
      });

      return updatedConnection;
    });

    return NextResponse.json({
      message: "Partner invitation accepted successfully.",
      connection: result,
    });
  } catch (error) {
    console.error(
      "POST /api/partner/invite/[token]/accept error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to accept partner invitation." },
      { status: 500 },
    );
  }
}