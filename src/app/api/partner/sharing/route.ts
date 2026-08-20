import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { partnerSharingSchema } from "@/lib/validations/partner";

export async function GET() {
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
      include: {
        sharingSetting: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { message: "No active partner connection found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      sharingSetting: connection.sharingSetting,
    });
  } catch (error) {
    console.error("GET /api/partner/sharing error:", error);

    return NextResponse.json(
      { message: "Failed to fetch sharing settings." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
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
        inviterUserId: session.user.id,
        status: "ACCEPTED",
      },
    });

    if (!connection) {
      return NextResponse.json(
        {
          message:
            "Only the primary user can modify sharing settings.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const result = partnerSharingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid sharing settings.",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const sharingSetting =
      await prisma.partnerSharingSetting.upsert({
        where: {
          connectionId: connection.id,
        },
        update: result.data,
        create: {
          connectionId: connection.id,
          ...result.data,
        },
      });

    return NextResponse.json({
      message: "Sharing settings updated successfully.",
      sharingSetting,
    });
  } catch (error) {
    console.error("PATCH /api/partner/sharing error:", error);

    return NextResponse.json(
      { message: "Failed to update sharing settings." },
      { status: 500 },
    );
  }
}