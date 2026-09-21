import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { periodEntrySchema } from "@/lib/validations/period";

import {
  calculateCycleLength,
  calculatePeriodLength,
  calculateNextPeriod,
  calculateOvulationDate,
  calculateFertileWindow,
  calculateCyclePhase,
} from "@/lib/period/calculations";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validation = periodEntrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid period data.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { startDate, endDate, mood, notes, isPrivate } = validation.data;

    if (endDate && endDate < startDate) {
      return NextResponse.json(
        { message: "Period end date cannot be before start date." },
        { status: 400 },
      );
    }

    const existingCycle = await prisma.cycle.findFirst({
      where: {
        userId: session.user.id,
        startDate,
      },
    });

    if (existingCycle) {
      return NextResponse.json(
        {
          message: "A cycle with this start date already exists.",
        },
        { status: 409 },
      );
    }

    // Check if start date falls inside another cycle's active bleeding days
    const enclosingCycle = await prisma.cycle.findFirst({
      where: {
        userId: session.user.id,
        startDate: { lte: startDate },
        endDate: { gte: startDate },
      },
    });

    if (enclosingCycle) {
      return NextResponse.json(
        {
          message:
            "The selected start date falls within an existing recorded period.",
        },
        { status: 400 },
      );
    }

    const previousCycle = await prisma.cycle.findFirst({
      where: {
        userId: session.user.id,
        startDate: {
          lt: startDate,
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    let cycleLength: number | null = null;

    if (previousCycle) {
      if (previousCycle.endDate && startDate <= previousCycle.endDate) {
        return NextResponse.json(
          {
            message:
              "Period start date overlaps with your previous cycle's active bleeding days.",
          },
          { status: 400 },
        );
      }

      cycleLength = calculateCycleLength(previousCycle.startDate, startDate);

      if (cycleLength < 15 || cycleLength > 90) {
        return NextResponse.json(
          {
            message: "Calculated cycle length must be between 15 and 90 days.",
          },
          { status: 400 },
        );
      }
    }

    // Check next subsequent cycle
    const nextCycle = await prisma.cycle.findFirst({
      where: {
        userId: session.user.id,
        startDate: {
          gt: startDate,
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    if (nextCycle) {
      if (endDate && endDate >= nextCycle.startDate) {
        return NextResponse.json(
          {
            message:
              "Period end date cannot overlap with or extend past your subsequent cycle start date.",
          },
          { status: 400 },
        );
      }

      const nextCycleLength = calculateCycleLength(
        startDate,
        nextCycle.startDate,
      );

      if (nextCycleLength < 15) {
        return NextResponse.json(
          {
            message:
              "Cycle start date is too close (less than 15 days) to your subsequent cycle.",
          },
          { status: 400 },
        );
      }
    }

    let periodLength: number | null = null;

    if (endDate) {
      periodLength = calculatePeriodLength(startDate, endDate);
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!healthProfile) {
      return NextResponse.json(
        {
          message: "Complete your health profile before tracking periods.",
        },
        { status: 400 },
      );
    }

    const averageCycleLength = healthProfile.averageCycleLength ?? 28;

    const averagePeriodLength = healthProfile.averagePeriodLength ?? 5;

    const predictionCycleLength = cycleLength ?? averageCycleLength;

    const predictedNextPeriod = calculateNextPeriod(
      startDate,
      predictionCycleLength,
    );

    const predictedOvulation = calculateOvulationDate(predictedNextPeriod);

    const { fertileStart, fertileEnd } =
      calculateFertileWindow(predictedOvulation);

    const phase = calculateCyclePhase(
      startDate,
      periodLength ?? averagePeriodLength,
      predictedOvulation,
    );

    const cycle = await prisma.cycle.create({
      data: {
        userId: session.user.id,
        startDate,
        endDate: endDate ?? null,
        cycleLength,
        periodLength,
        mood: mood ?? null,
        notes: notes ?? null,
        isPrivate: isPrivate ?? false,
        predictedNextPeriod,
        predictedOvulation,
        fertileStart,
        fertileEnd,
        phase,
      },
    });

    return NextResponse.json(
      {
        message: "Cycle created successfully.",
        cycle,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create cycle error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let cycles = await prisma.cycle.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    if (cycles.length === 0) {
      const healthProfile = await prisma.healthProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (healthProfile?.lastPeriodDate) {
        const startDate = new Date(healthProfile.lastPeriodDate);
        const averageCycleLength = healthProfile.averageCycleLength ?? 28;
        const averagePeriodLength = healthProfile.averagePeriodLength ?? 5;

        const predictedNextPeriod = calculateNextPeriod(
          startDate,
          averageCycleLength
        );
        const predictedOvulation =
          calculateOvulationDate(predictedNextPeriod);
        const { fertileStart, fertileEnd } =
          calculateFertileWindow(predictedOvulation);
        const phase = calculateCyclePhase(
          startDate,
          averagePeriodLength,
          predictedOvulation
        );

        const endDate = new Date(
          startDate.getTime() +
            (averagePeriodLength - 1) * 24 * 60 * 60 * 1000
        );

        const initialCycle = await prisma.cycle.create({
          data: {
            userId: session.user.id,
            startDate,
            endDate,
            periodLength: averagePeriodLength,
            predictedNextPeriod,
            predictedOvulation,
            fertileStart,
            fertileEnd,
            phase,
            notes: "Initial cycle recorded from health profile setup.",
          },
        });

        cycles = [initialCycle];
      }
    }

    return NextResponse.json(
      {
        cycles,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get cycles error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}
