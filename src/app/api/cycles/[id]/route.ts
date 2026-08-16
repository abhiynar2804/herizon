import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { periodUpdateSchema } from "@/lib/validations/period";

import {
  calculatePeriodLength,
  calculateCyclePhase,
} from "@/lib/period/calculations";

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

    const existingCycle = await prisma.cycle.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCycle) {
      return NextResponse.json(
        { message: "Cycle not found." },
        { status: 404 },
      );
    }

    const body = await request.json();

    const validation = periodUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid period data.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { endDate, mood, notes, isPrivate } = validation.data;

    if (endDate && endDate < existingCycle.startDate) {
      return NextResponse.json(
        {
          message: "End date cannot be before cycle start date.",
        },
        { status: 400 },
      );
    }

    let periodLength = existingCycle.periodLength;

    if (endDate) {
      periodLength = calculatePeriodLength(existingCycle.startDate, endDate);
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    const averagePeriodLength = healthProfile?.averagePeriodLength ?? 5;

    const effectivePeriodLength = periodLength ?? averagePeriodLength;

    let phase = existingCycle.phase;

    if (existingCycle.predictedOvulation) {
      phase = calculateCyclePhase(
        existingCycle.startDate,
        effectivePeriodLength,
        existingCycle.predictedOvulation,
      );
    }

    const updatedCycle = await prisma.cycle.update({
      where: {
        id: existingCycle.id,
      },
      data: {
        endDate: endDate !== undefined ? endDate : existingCycle.endDate,

        periodLength,

        mood: mood !== undefined ? mood : existingCycle.mood,

        notes: notes !== undefined ? notes : existingCycle.notes,

        isPrivate:
          isPrivate !== undefined ? isPrivate : existingCycle.isPrivate,

        phase,
      },
    });

    return NextResponse.json(
      {
        message: "Cycle updated successfully.",
        cycle: updatedCycle,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update cycle error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}
