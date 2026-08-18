import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateSymptomRules } from "@/lib/symptoms/rule-engine";

const symptomCheckSchema = z.object({
  symptomIds: z
    .array(z.string().min(1))
    .min(1, "Select at least one symptom."),

  notes: z
    .string()
    .trim()
    .max(2000, "Notes are too long.")
    .optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const result = symptomCheckSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid symptom check data.",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { symptomIds, notes } = result.data;

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
        name: true,
        severity: true,
      },
    });

    if (symptoms.length !== uniqueSymptomIds.length) {
      return NextResponse.json(
        {
          message:
            "One or more selected symptoms are invalid or inactive.",
        },
        { status: 400 },
      );
    }

    const evaluation = await evaluateSymptomRules(uniqueSymptomIds);

    const symptomCheck = await prisma.symptomCheck.create({
      data: {
        userId: session.user.id,
        notes,
        recommendation: evaluation.recommendation,
        urgencyLevel: evaluation.priority,

        symptoms: {
          create: uniqueSymptomIds.map((symptomId) => ({
            symptomId,
          })),
        },
      },

      include: {
        symptoms: {
          include: {
            symptom: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: symptomCheck.id,
        symptoms: symptomCheck.symptoms.map(
          (item) => item.symptom,
        ),
        result: evaluation,
        notes: symptomCheck.notes,
        createdAt: symptomCheck.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/symptoms/check error:", error);

    return NextResponse.json(
      { message: "Failed to process symptom check." },
      { status: 500 },
    );
  }
}