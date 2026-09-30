import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found." },
        { status: 404 },
      );
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Notification marked as read.",
        notification: updated,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/notifications/[id] error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found." },
        { status: 404 },
      );
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Notification deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/notifications/[id] error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}
