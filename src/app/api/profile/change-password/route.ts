import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/password";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(100),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: validation.error.issues[0]?.message || "Invalid input.",
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { message: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const newHashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/profile/change-password error:", error);
    return NextResponse.json(
      { message: "Failed to change password." },
      { status: 500 }
    );
  }
}
