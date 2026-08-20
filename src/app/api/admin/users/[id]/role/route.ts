import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const validRoles = ["USER", "PARTNER", "ADMIN"] as const;

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

    if (
      typeof body.role !== "string" ||
      !validRoles.includes(body.role)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid role. Allowed roles: USER, PARTNER, ADMIN.",
        },
        { status: 400 },
      );
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { message: "Admin cannot change their own role." },
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
        role: body.role,
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
        action: "CHANGE_USER_ROLE",
        targetType: "USER",
        targetId: user.id,
        details: JSON.stringify({
          previousRole: user.role,
          newRole: body.role,
        }),
      },
    });

    return NextResponse.json({
      message: "User role updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/users/[id]/role error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to update user role." },
      { status: 500 },
    );
  }
}