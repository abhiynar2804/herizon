import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { symptomSchema } from "@/lib/validations/symptom";

export async function GET() {
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

    const symptoms = await prisma.symptom.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(symptoms);
  } catch (error) {
    console.error("GET /api/admin/symptoms error:", error);

    return NextResponse.json(
      { message: "Failed to fetch symptoms." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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

    const { name, description, severity, isActive } = result.data;

    const existingSymptom = await prisma.symptom.findUnique({
      where: { name },
    });

    if (existingSymptom) {
      return NextResponse.json(
        { message: "A symptom with this name already exists." },
        { status: 409 },
      );
    }

    const symptom = await prisma.symptom.create({
      data: {
        name,
        description,
        severity,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(symptom, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/symptoms error:", error);

    return NextResponse.json(
      { message: "Failed to create symptom." },
      { status: 500 },
    );
  }
}