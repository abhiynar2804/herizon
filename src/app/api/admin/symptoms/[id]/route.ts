import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { symptomSchema } from "@/lib/validations/symptom";

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

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const { id } = await context.params;

    const symptom = await prisma.symptom.findUnique({
      where: { id },
    });

    if (!symptom) {
      return NextResponse.json(
        { message: "Symptom not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(symptom);
  } catch (error) {
    console.error("GET /api/admin/symptoms/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to fetch symptom." },
      { status: 500 },
    );
  }
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

    const result = symptomSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid symptom data.",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existingSymptom = await prisma.symptom.findUnique({
      where: { id },
    });

    if (!existingSymptom) {
      return NextResponse.json(
        { message: "Symptom not found." },
        { status: 404 },
      );
    }

    const { name, description, severity, isActive } = result.data;

    const duplicate = await prisma.symptom.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { message: "A symptom with this name already exists." },
        { status: 409 },
      );
    }

    const symptom = await prisma.symptom.update({
      where: { id },
      data: {
        name,
        description,
        severity,
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(symptom);
  } catch (error) {
    console.error("PATCH /api/admin/symptoms/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to update symptom." },
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

    const symptom = await prisma.symptom.findUnique({
      where: { id },
    });

    if (!symptom) {
      return NextResponse.json(
        { message: "Symptom not found." },
        { status: 404 },
      );
    }

    // We intentionally deactivate instead of deleting.
    // Existing symptom history must remain valid.
    const updatedSymptom = await prisma.symptom.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      message: "Symptom deactivated successfully.",
      symptom: updatedSymptom,
    });
  } catch (error) {
    console.error("DELETE /api/admin/symptoms/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to deactivate symptom." },
      { status: 500 },
    );
  }
}