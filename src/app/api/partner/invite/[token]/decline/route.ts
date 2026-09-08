import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function POST(
  _request: Request,
  context: RouteContext
) {
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
        { message: "Only partner users can decline invitations." },
        { status: 403 }
      );
    }

    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { message: "Invalid invitation token." },
        { status: 400 }
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
        { status: 404 }
      );
    }

    if (connection.inviteeUserId !== session.user.id) {
      return NextResponse.json(
        { message: "You are not authorized to decline this invitation." },
        { status: 403 }
      );
    }

    if (connection.status !== "PENDING") {
      return NextResponse.json(
        { message: "This invitation is no longer pending." },
        { status: 409 }
      );
    }

    await prisma.partnerConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        status: "REJECTED",
      },
    });

    await prisma.notification.create({
      data: {
        userId: connection.inviterUserId,
        title: "Partner Invitation Declined",
        message: "Your partner invitation has been declined.",
        type: "PARTNER_INVITE",
        channel: "IN_APP",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Partner invitation declined successfully.",
    });
  } catch (error) {
    console.error(
      "POST /api/partner/invite/[token]/decline error:",
      error
    );

    return NextResponse.json(
      { message: "Failed to decline partner invitation." },
      { status: 500 }
    );
  }
}