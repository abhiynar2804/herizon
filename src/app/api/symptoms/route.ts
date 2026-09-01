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

    const symptoms = await prisma.symptom.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        severity: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      { symptoms },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/symptoms error:", error);

    return NextResponse.json(
      { message: "Failed to fetch symptoms." },
      { status: 500 },
    );
  }
}