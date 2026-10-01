import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid", request.url)
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid", request.url)
      );
    }

    if (
      user.emailVerificationExpiry &&
      new Date(user.emailVerificationExpiry) < new Date()
    ) {
      return NextResponse.redirect(
        new URL("/verify-email?error=expired", request.url)
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return NextResponse.redirect(
      new URL("/verify-email?verified=true", request.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/verify-email?error=failed", request.url)
    );
  }
}
