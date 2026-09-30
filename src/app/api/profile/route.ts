import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  avatarUrl: z.string().url("Invalid URL").or(z.literal("")).nullable().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        avatarUrl: true,
        createdAt: true,
        healthProfile: {
          select: {
            id: true,
            bloodGroup: true,
            heightCm: true,
            weightKg: true,
            averageCycleLength: true,
            averagePeriodLength: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { message: "Failed to fetch profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid profile data.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, avatarUrl } = validation.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(avatarUrl !== undefined && {
          avatarUrl: avatarUrl === "" ? null : avatarUrl,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        emailVerified: true,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      { message: "Failed to update profile." },
      { status: 500 }
    );
  }
}
