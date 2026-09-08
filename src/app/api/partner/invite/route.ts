import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "USER") {
      return NextResponse.json(
        { error: "Only users can send partner invitations." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    if (email.toLowerCase() === session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot invite yourself." },
        { status: 400 }
      );
    }

    const invitee = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!invitee || !invitee.isActive || invitee.role !== "PARTNER") {
      return NextResponse.json(
        { error: "No active partner account found with this email." },
        { status: 404 }
      );
    }

    // A5: The primary user can have only one active partner connection.
    const activeConnection = await prisma.partnerConnection.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { inviterUserId: session.user.id },
          { inviteeUserId: session.user.id },
        ],
      },
    });

    if (activeConnection) {
      return NextResponse.json(
        { error: "You already have an active partner connection. Disconnect it before sending a new invitation." },
        { status: 409 }
      );
    }

    // Find an existing connection between this exact pair.
    const existingConnection =
      await prisma.partnerConnection.findUnique({
        where: {
          inviterUserId_inviteeUserId: {
            inviterUserId: session.user.id,
            inviteeUserId: invitee.id,
          },
        },
      });

    // Existing pending invitation.
    if (existingConnection?.status === "PENDING") {
      return NextResponse.json(
        { error: "An invitation has already been sent to this partner." },
        { status: 409 }
      );
    }

    // Reuse an old DISCONNECTED or REJECTED connection.
    if (
      existingConnection?.status === "DISCONNECTED" ||
      existingConnection?.status === "REJECTED"
    ) {
      const inviteToken = crypto.randomBytes(32).toString("hex");

      const connection = await prisma.partnerConnection.update({
        where: {
          id: existingConnection.id,
        },
        data: {
          status: "PENDING",
          inviteToken,
          invitedAt: new Date(),
          acceptedAt: null,
          disconnectedAt: null,
        },
      });

      await prisma.notification.create({
        data: {
          userId: invitee.id,
          type: "PARTNER_INVITE",
          title: "New Partner Invitation",
          message: `${session.user.name || "A user"} has invited you to connect as their partner.`,
        },
      });

      return NextResponse.json({
        success: true,
        connectionId: connection.id,
        message: "Partner invitation sent successfully.",
      });
    }

    // No previous connection — create a new one.
    const inviteToken = crypto.randomBytes(32).toString("hex");

    const connection = await prisma.partnerConnection.create({
      data: {
        inviterUserId: session.user.id,
        inviteeUserId: invitee.id,
        status: "PENDING",
        inviteToken,
      },
    });

    await prisma.notification.create({
      data: {
        userId: invitee.id,
        type: "PARTNER_INVITE",
        title: "New Partner Invitation",
        message: `${session.user.name || "A user"} has invited you to connect as their partner.`,
      },
    });

    return NextResponse.json({
      success: true,
      connectionId: connection.id,
      message: "Partner invitation sent successfully.",
    });
  } catch (error) {
    console.error("Partner invitation error:", error);

    return NextResponse.json(
      { error: "Failed to send partner invitation." },
      { status: 500 }
    );
  }
}