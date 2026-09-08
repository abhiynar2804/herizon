import { CyclePhase } from "@/generated/prisma/client";

export function calculateCycleLength(
  previousStartDate: Date,
  currentStartDate: Date
): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const previous = new Date(previousStartDate);
  const current = new Date(currentStartDate);

  previous.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);

  const difference =
    current.getTime() - previous.getTime();

  return Math.round(difference / millisecondsPerDay);
}

export function calculatePeriodLength(
  startDate: Date,
  endDate: Date
): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference =
    end.getTime() - start.getTime();

  return Math.round(difference / millisecondsPerDay) + 1;
}

export function calculateNextPeriod(
  startDate: Date,
  averageCycleLength: number
): Date {
  const nextPeriod = new Date(startDate);

  nextPeriod.setDate(
    nextPeriod.getDate() + averageCycleLength
  );

  return nextPeriod;
}

export function calculateOvulationDate(
  nextPeriodDate: Date
): Date {
  const ovulationDate = new Date(nextPeriodDate);

  ovulationDate.setDate(
    ovulationDate.getDate() - 14
  );

  return ovulationDate;
}

export function calculateFertileWindow(
  ovulationDate: Date
): {
  fertileStart: Date;
  fertileEnd: Date;
} {
  const fertileStart = new Date(ovulationDate);
  const fertileEnd = new Date(ovulationDate);

  fertileStart.setDate(
    fertileStart.getDate() - 5
  );

  fertileEnd.setDate(
    fertileEnd.getDate() + 1
  );

  return {
    fertileStart,
    fertileEnd,
  };
}

export function calculateCyclePhase(
  cycleStartDate: Date,
  periodLength: number,
  ovulationDate: Date,
  currentDate: Date = new Date()
): CyclePhase {
  const current = new Date(currentDate);
  const start = new Date(cycleStartDate);
  const ovulation = new Date(ovulationDate);

  current.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  ovulation.setHours(0, 0, 0, 0);

  const periodEnd = new Date(start);

  periodEnd.setDate(
    periodEnd.getDate() + periodLength - 1
  );

  if (current >= start && current <= periodEnd) {
    return "MENSTRUAL";
  }

  const ovulationStart = new Date(ovulation);
  const ovulationEnd = new Date(ovulation);

  ovulationStart.setDate(
    ovulationStart.getDate() - 1
  );

  ovulationEnd.setDate(
    ovulationEnd.getDate() + 1
  );

  if (
    current >= ovulationStart &&
    current <= ovulationEnd
  ) {
    return "OVULATION";
  }

  if (current < ovulation) {
    return "FOLLICULAR";
  }

  return "LUTEAL";
}