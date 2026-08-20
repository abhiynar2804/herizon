import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { partnerInviteSchema } from "@/lib/validations/partner";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (session.user.role !== "USER") {
      return NextResponse.json(
        { message: "Only primary users can send partner invites." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const result = partnerInviteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid partner email.",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const email = result.data.email.toLowerCase();

    const inviter = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!inviter) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 },
      );
    }

    if (email === inviter.email.toLowerCase()) {
      return NextResponse.json(
        { message: "You cannot invite yourself." },
        { status: 400 },
      );
    }

    const invitee = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!invitee) {
      return NextResponse.json(
        { message: "No registered user found with this email." },
        { status: 404 },
      );
    }

    if (!invitee.isActive) {
      return NextResponse.json(
        { message: "This user account is inactive." },
        { status: 400 },
      );
    }

    if (invitee.role !== "PARTNER") {
      return NextResponse.json(
        { message: "This user is not eligible as a partner." },
        { status: 400 },
      );
    }

    const existingConnection =
      await prisma.partnerConnection.findFirst({
        where: {
          OR: [
            {
              inviterUserId: inviter.id,
              inviteeUserId: invitee.id,
            },
            {
              inviterUserId: invitee.id,
              inviteeUserId: inviter.id,
            },
          ],
        },
      });

    if (existingConnection) {
      if (existingConnection.status === "ACCEPTED") {
        return NextResponse.json(
          { message: "A partner connection already exists." },
          { status: 409 },
        );
      }

      if (existingConnection.status === "PENDING") {
        return NextResponse.json(
          { message: "A partner invitation is already pending." },
          { status: 409 },
        );
      }
    }

    const inviteToken = randomBytes(32).toString("hex");

    const connection = await prisma.partnerConnection.create({
      data: {
        inviterUserId: inviter.id,
        inviteeUserId: invitee.id,
        inviteToken,
        status: "PENDING",
      },
      select: {
        id: true,
        status: true,
        invitedAt: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: invitee.id,
        title: "Partner Invitation",
        message: `${inviter.name} has invited you to connect as a partner.`,
        type: "PARTNER_INVITE",
        channel: "IN_APP",
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Partner invitation sent successfully.",
        connection,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/partner/invite error:", error);

    return NextResponse.json(
      { message: "Failed to send partner invitation." },
      { status: 500 },
    );
  }
}