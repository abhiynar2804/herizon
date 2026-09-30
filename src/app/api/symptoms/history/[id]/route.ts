import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingCheck = await prisma.symptomCheck.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCheck) {
      return NextResponse.json(
        { message: "Symptom check not found." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;

    if (notes && notes.length > 2000) {
      return NextResponse.json(
        { message: "Notes cannot exceed 2000 characters." },
        { status: 400 },
      );
    }

    const updatedCheck = await prisma.symptomCheck.update({
      where: {
        id: existingCheck.id,
      },
      data: {
        notes,
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
        message: "Symptom check updated successfully.",
        check: updatedCheck,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/symptoms/history/[id] error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingCheck = await prisma.symptomCheck.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCheck) {
      return NextResponse.json(
        { message: "Symptom check not found." },
        { status: 404 },
      );
    }

    await prisma.symptomCheck.delete({
      where: {
        id: existingCheck.id,
      },
    });

    return NextResponse.json(
      { message: "Symptom check deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/symptoms/history/[id] error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}
