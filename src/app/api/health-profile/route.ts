import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { healthProfileSchema } from "@/lib/validations/health-profile";
import {
  calculateNextPeriod,
  calculateOvulationDate,
  calculateFertileWindow,
  calculateCyclePhase,
} from "@/lib/period/calculations";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!healthProfile) {
      return NextResponse.json(
        { message: "Health profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { healthProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get health profile error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = healthProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid health profile data.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existingProfile = await prisma.healthProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (existingProfile) {
      return NextResponse.json(
        { message: "Health profile already exists." },
        { status: 409 }
      );
    }

    const healthProfile = await prisma.healthProfile.create({
      data: {
        userId: session.user.id,
        ...validation.data,
      },
    });

    if (validation.data.lastPeriodDate) {
      const startDate = new Date(validation.data.lastPeriodDate);
      const averageCycleLength =
        validation.data.averageCycleLength ?? 28;
      const averagePeriodLength =
        validation.data.averagePeriodLength ?? 5;

      const existingCycle = await prisma.cycle.findFirst({
        where: {
          userId: session.user.id,
          startDate,
        },
      });

      if (!existingCycle) {
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

        await prisma.cycle.create({
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
      }
    }

    return NextResponse.json(
      {
        message: "Health profile created successfully.",
        healthProfile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create health profile error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = healthProfileSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid health profile data.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existingProfile = await prisma.healthProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { message: "Health profile not found." },
        { status: 404 }
      );
    }

    const updatedProfile = await prisma.healthProfile.update({
      where: {
        userId: session.user.id,
      },
      data: validation.data,
    });

    if (validation.data.lastPeriodDate) {
      const startDate = new Date(validation.data.lastPeriodDate);
      const averageCycleLength =
        validation.data.averageCycleLength ??
        existingProfile.averageCycleLength ??
        28;
      const averagePeriodLength =
        validation.data.averagePeriodLength ??
        existingProfile.averagePeriodLength ??
        5;

      const existingCycle = await prisma.cycle.findFirst({
        where: {
          userId: session.user.id,
          startDate,
        },
      });

      if (!existingCycle) {
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

        await prisma.cycle.create({
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
      }
    }

    return NextResponse.json(
      {
        message: "Health profile updated successfully.",
        healthProfile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update health profile error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}