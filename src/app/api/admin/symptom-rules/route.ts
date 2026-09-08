import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { symptomRuleSchema } from "@/lib/validations/symptom-rule";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      response: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      response: NextResponse.json(
        { message: "Forbidden" },
        { status: 403 },
      ),
    };
  }

  return { session };
}

export async function GET() {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const rules = await prisma.symptomRule.findMany({
      include: {
        conditions: {
          include: {
            symptom: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("GET /api/admin/symptom-rules error:", error);

    return NextResponse.json(
      { message: "Failed to fetch symptom rules." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const body = await request.json();

    const result = symptomRuleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid symptom rule data.",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      title,
      recommendation,
      priority,
      isEmergency,
      isActive,
      symptomIds,
    } = result.data;

    const uniqueSymptomIds = [...new Set(symptomIds)];

    const symptoms = await prisma.symptom.findMany({
      where: {
        id: {
          in: uniqueSymptomIds,
        },
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (symptoms.length !== uniqueSymptomIds.length) {
      return NextResponse.json(
        {
          message:
            "One or more symptoms are invalid or inactive.",
        },
        { status: 400 },
      );
    }

    const rule = await prisma.symptomRule.create({
      data: {
        title,
        recommendation,
        priority,
        isEmergency: isEmergency ?? false,
        isActive: isActive ?? true,

        conditions: {
          create: uniqueSymptomIds.map((symptomId) => ({
            symptomId,
          })),
        },
      },
      include: {
        conditions: {
          include: {
            symptom: true,
          },
        },
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/symptom-rules error:", error);

    return NextResponse.json(
      { message: "Failed to create symptom rule." },
      { status: 500 },
    );
  }
}