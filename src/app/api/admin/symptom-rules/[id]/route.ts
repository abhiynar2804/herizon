import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { symptomRuleSchema } from "@/lib/validations/symptom-rule";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const { id } = await context.params;
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

    const existingRule = await prisma.symptomRule.findUnique({
      where: { id },
    });

    if (!existingRule) {
      return NextResponse.json(
        { message: "Symptom rule not found." },
        { status: 404 },
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

    const updatedRule = await prisma.$transaction(async (tx) => {
      await tx.symptomRuleCondition.deleteMany({
        where: {
          ruleId: id,
        },
      });

      return tx.symptomRule.update({
        where: { id },
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
    });

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error("PATCH /api/admin/symptom-rules/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to update symptom rule." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const { id } = await context.params;

    const existingRule = await prisma.symptomRule.findUnique({
      where: { id },
    });

    if (!existingRule) {
      return NextResponse.json(
        { message: "Symptom rule not found." },
        { status: 404 },
      );
    }

    const rule = await prisma.symptomRule.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      message: "Symptom rule deactivated successfully.",
      rule,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/symptom-rules/[id] error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to deactivate symptom rule." },
      { status: 500 },
    );
  }
}