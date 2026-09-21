import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchNotificationSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional(),
});

const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  message: z.string().min(1, "Message is required").max(500),
  type: z
    .enum(["PERIOD_REMINDER", "HEALTH_TIP", "PARTNER_INVITE", "SYSTEM"])
    .default("HEALTH_TIP"),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check count and seed initial notifications if empty
    const existingCount = await prisma.notification.count({
      where: { userId },
    });

    if (existingCount === 0) {
      // Seed default welcome & health guidance notification
      await prisma.notification.create({
        data: {
          userId,
          title: "Welcome to Herizon In-App Reminders",
          message:
            "Log your daily symptoms and cycle updates to receive personalized hormone, wellness, and partner sync reminders.",
          type: "SYSTEM",
          status: "PENDING",
        },
      });

      // If user has a cycle logged, also create a tip
      const cycle = await prisma.cycle.findFirst({
        where: { userId },
        orderBy: { startDate: "desc" },
      });

      if (cycle) {
        await prisma.notification.create({
          data: {
            userId,
            title: "Cycle Phase Active",
            message: `You are currently tracking your ${cycle.phase.toLowerCase()} phase. Check your dashboard blueprint for nutrition and hydration tips.`,
            type: "HEALTH_TIP",
            status: "PENDING",
          },
        });
      }
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.count({
        where: {
          userId,
          status: { not: "READ" },
        },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const parsed = patchNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { notificationId, markAll } = parsed.data;

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          userId,
          status: { not: "READ" },
        },
        data: {
          status: "READ",
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read.",
      });
    }

    if (notificationId) {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          status: "READ",
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Notification marked as read.",
      });
    }

    return NextResponse.json(
      { error: "No notification ID or markAll flag provided." },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to update notification status." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const parsed = createNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid payload." },
        { status: 400 }
      );
    }

    const { title, message, type } = parsed.data;

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        channel: "IN_APP",
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to create reminder/notification." },
      { status: 500 }
    );
  }
}
