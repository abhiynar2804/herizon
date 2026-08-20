import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { message: "isActive must be a boolean." },
        { status: 400 },
      );
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { message: "Admin cannot deactivate their own account." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: body.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        actorId: session.user.id,
        action: body.isActive
          ? "ACTIVATE_USER"
          : "DEACTIVATE_USER",
        targetType: "USER",
        targetId: user.id,
        details: JSON.stringify({
          previousStatus: user.isActive,
          newStatus: body.isActive,
        }),
      },
    });

    return NextResponse.json({
      message: body.isActive
        ? "User activated successfully."
        : "User deactivated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/users/[id]/status error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to update user status." },
      { status: 500 },
    );
  }
}