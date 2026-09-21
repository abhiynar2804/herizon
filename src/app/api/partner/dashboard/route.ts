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

    if (session.user.role !== "PARTNER") {
      return NextResponse.json(
        { message: "Only partners can access this dashboard." },
        { status: 403 },
      );
    }

    const connection = await prisma.partnerConnection.findFirst({
      where: {
        inviteeUserId: session.user.id,
        status: "ACCEPTED",
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
          },
        },
        sharingSetting: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { message: "No active partner connection found." },
        { status: 404 },
      );
    }

    const settings = connection.sharingSetting;

    if (!settings) {
      return NextResponse.json(
        { message: "Sharing settings not configured." },
        { status: 404 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: connection.inviterUserId,
      },
      include: {
        healthProfile: true,
        cycles: {
          orderBy: {
            startDate: "desc",
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Connected user not found." },
        { status: 404 },
      );
    }

    const dashboard: {
      partnerName: string;
      cyclePhase?: string;
      nextPeriod?: Date | null;
      mood?: string | null;
      careSuggestions?: string;
      reminders?: boolean;
    } = {
      partnerName: connection.inviter.name,
    };

    if (settings.shareCyclePhase) {
      dashboard.cyclePhase = user.cycles[0]?.phase;
    }

    if (settings.shareNextPeriod) {
      dashboard.nextPeriod =
        user.cycles[0]?.predictedNextPeriod ?? null;
    }

    if (settings.shareMood) {
      dashboard.mood = user.cycles[0]?.mood ?? null;
    }

    if (settings.shareCareSuggestions) {
      if (settings.shareCyclePhase && user.cycles[0]?.phase) {
        dashboard.careSuggestions = `Support suggestions tailored for ${user.cycles[0].phase.toLowerCase()} phase.`;
      } else {
        dashboard.careSuggestions =
          "Be supportive and check in with your partner for everyday wellness.";
      }
    }

    if (settings.shareReminders) {
      dashboard.reminders = true;
    }

    return NextResponse.json({
      sharingSetting: settings,
      dashboard,
    });
  } catch (error) {
    console.error(
      "GET /api/partner/dashboard error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to fetch partner dashboard." },
      { status: 500 },
    );
  }
}