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

    const history = await prisma.symptomCheck.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        symptoms: {
          include: {
            symptom: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET /api/symptoms/history error:", error);

    return NextResponse.json(
      { message: "Failed to fetch symptom history." },
      { status: 500 },
    );
  }
}