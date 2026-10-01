"use client";

import { useState, useMemo } from "react";

type CycleSymptom = {
  id?: string;
  symptom: {
    id: string;
    name: string;
    severity?: string;
  };
};

type Cycle = {
  id: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number | null;
  periodLength: number | null;
  mood: string | null;
  notes: string | null;
  predictedNextPeriod: string | null;
  predictedOvulation: string | null;
  fertileStart: string | null;
  fertileEnd: string | null;
  phase: string;
  symptoms?: CycleSymptom[];
};

type CycleCalendarProps = {
  cycles: Cycle[];
  onEditCycle?: (cycle: Cycle) => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CycleCalendar({ cycles, onEditCycle }: CycleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDay(new Date());
  };

  // Calendar Grid Days computation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayIndex = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days: {
      date: Date;
      isCurrentMonth: boolean;
      dateString: string;
    }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateString: d.toISOString().split("T")[0],
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        dateString: d.toISOString().split("T")[0],
      });
    }

    // Next month padding to fill grid (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateString: d.toISOString().split("T")[0],
      });
    }

    return days;
  }, [year, month]);

  // Helper to compare dates ignoring time (YYYY-MM-DD)
  const isSameDate = (d1: Date, d2String: string | null | undefined) => {
    if (!d2String) return false;
    const d2 = new Date(d2String);
    return (
      d1.getFullYear() === d2.getUTCFullYear() &&
      d1.getMonth() === d2.getUTCMonth() &&
      d1.getDate() === d2.getUTCDate()
    );
  };

  const isBetweenDates = (
    current: Date,
    startStr: string | null | undefined,
    endStr: string | null | undefined,
  ) => {
    if (!startStr) return false;
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date(startStr);

    const curTime = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate(),
    ).getTime();
    const startTime = new Date(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate(),
    ).getTime();
    const endTime = new Date(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      end.getUTCDate(),
    ).getTime();

    return curTime >= startTime && curTime <= endTime;
  };

  // Find info for a given day
  const getDayInfo = (date: Date) => {
    let isPeriod = false;
    let isFertile = false;
    let isOvulation = false;
    let isPredictedPeriod = false;
    let matchingCycle: Cycle | null = null;

    for (const c of cycles) {
      if (isBetweenDates(date, c.startDate, c.endDate)) {
        isPeriod = true;
        matchingCycle = c;
      }
      if (isSameDate(date, c.predictedOvulation)) {
        isOvulation = true;
        if (!matchingCycle) matchingCycle = c;
      }
      if (isBetweenDates(date, c.fertileStart, c.fertileEnd)) {
        isFertile = true;
        if (!matchingCycle) matchingCycle = c;
      }
      if (isSameDate(date, c.predictedNextPeriod)) {
        isPredictedPeriod = true;
        if (!matchingCycle) matchingCycle = c;
      }
    }

    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    return {
      isPeriod,
      isFertile,
      isOvulation,
      isPredictedPeriod,
      isToday,
      matchingCycle,
    };
  };

  const selectedDayInfo = selectedDay ? getDayInfo(selectedDay) : null;

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-pink-100/60 space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>📅</span>
            <span>
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Interactive visual cycle tracking &amp; prediction calendar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Today
          </button>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition"
              aria-label="Previous Month"
            >
              ←
            </button>
            <div className="w-px bg-gray-200" />
            <button
              type="button"
              onClick={handleNextMonth}
              className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition"
              aria-label="Next Month"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold uppercase tracking-wider text-gray-400">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const {
            isPeriod,
            isFertile,
            isOvulation,
            isPredictedPeriod,
            isToday,
            matchingCycle,
          } = getDayInfo(date);

          const isSelected =
            selectedDay &&
            selectedDay.getDate() === date.getDate() &&
            selectedDay.getMonth() === date.getMonth() &&
            selectedDay.getFullYear() === date.getFullYear();

          let bgClass = "bg-white text-gray-700 hover:bg-pink-50/40";
          let borderClass = "border border-gray-100";

          if (isPeriod) {
            bgClass = "bg-rose-500 text-white font-bold hover:bg-rose-600";
            borderClass = "border border-rose-600";
          } else if (isOvulation) {
            bgClass = "bg-amber-400 text-amber-950 font-bold hover:bg-amber-500";
            borderClass = "border border-amber-500";
          } else if (isFertile) {
            bgClass = "bg-purple-100 text-purple-900 font-semibold hover:bg-purple-200";
            borderClass = "border border-purple-300";
          } else if (isPredictedPeriod) {
            bgClass = "bg-pink-50 text-pink-700 font-medium hover:bg-pink-100";
            borderClass = "border-2 border-pink-400 border-dashed";
          }

          if (!isCurrentMonth && !isPeriod && !isFertile && !isOvulation && !isPredictedPeriod) {
            bgClass = "bg-gray-50/50 text-gray-300";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDay(date)}
              className={`min-h-[56px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between text-left transition-all ${bgClass} ${borderClass} ${
                isSelected ? "ring-2 ring-pink-600 ring-offset-2 scale-[1.02]" : ""
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    isToday && !isPeriod
                      ? "h-5 w-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px]"
                      : ""
                  }`}
                >
                  {date.getDate()}
                </span>

                {isOvulation && <span className="text-[10px]" title="Ovulation Day">✨</span>}
                {isPeriod && <span className="text-[10px]" title="Period Bleeding Day">🩸</span>}
              </div>

              <div className="w-full space-y-0.5 mt-1">
                {isPeriod && (
                  <span className="block truncate text-[9px] uppercase tracking-wider font-extrabold text-white/90">
                    Period
                  </span>
                )}
                {isOvulation && !isPeriod && (
                  <span className="block truncate text-[9px] uppercase tracking-wider font-extrabold text-amber-950">
                    Ovulation
                  </span>
                )}
                {isFertile && !isPeriod && !isOvulation && (
                  <span className="block truncate text-[9px] uppercase tracking-wider text-purple-700 font-semibold">
                    Fertile
                  </span>
                )}
                {isPredictedPeriod && !isPeriod && (
                  <span className="block truncate text-[9px] uppercase tracking-wider text-pink-600 font-semibold">
                    Predicted
                  </span>
                )}
                {matchingCycle?.symptoms && matchingCycle.symptoms.length > 0 && isPeriod && (
                  <span className="block text-[8px] opacity-80">
                    {matchingCycle.symptoms.length} symptom{matchingCycle.symptoms.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Details Panel */}
      {selectedDay && (
        <div className="rounded-2xl bg-gray-50/80 p-4 border border-gray-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">
              Selected: {selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
            </span>
            {selectedDayInfo?.matchingCycle && onEditCycle && (
              <button
                onClick={() => onEditCycle(selectedDayInfo.matchingCycle!)}
                className="text-pink-600 font-bold hover:underline"
              >
                Edit Cycle Record →
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {selectedDayInfo?.isPeriod && (
              <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-bold text-[11px]">
                🩸 Period Bleeding Day
              </span>
            )}
            {selectedDayInfo?.isOvulation && (
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 font-bold text-[11px]">
                ✨ Peak Ovulation Window
              </span>
            )}
            {selectedDayInfo?.isFertile && (
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px]">
                🌿 Fertile Window
              </span>
            )}
            {selectedDayInfo?.isPredictedPeriod && (
              <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 font-bold text-[11px]">
                🔮 Predicted Next Period
              </span>
            )}
            {!selectedDayInfo?.isPeriod &&
              !selectedDayInfo?.isOvulation &&
              !selectedDayInfo?.isFertile &&
              !selectedDayInfo?.isPredictedPeriod && (
                <span className="text-gray-500">
                  Standard cycle day. No significant hormonal peak predicted.
                </span>
              )}
          </div>

          {selectedDayInfo?.matchingCycle?.notes && (
            <p className="text-gray-600 text-[11px] pt-1 border-t border-gray-200">
              <strong>Notes:</strong> {selectedDayInfo.matchingCycle.notes}
            </p>
          )}

          {selectedDayInfo?.matchingCycle?.symptoms && selectedDayInfo.matchingCycle.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-gray-400 text-[11px]">Logged Symptoms:</span>
              {selectedDayInfo.matchingCycle.symptoms.map((s) => (
                <span
                  key={s.symptom.id}
                  className="px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-[10px]"
                >
                  {s.symptom.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-rose-500 inline-block" />
          <span>Period Days</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-purple-200 inline-block" />
          <span>Fertile Window</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-amber-400 inline-block" />
          <span>Ovulation Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-pink-100 border border-pink-400 border-dashed inline-block" />
          <span>Predicted Period</span>
        </div>
      </div>
    </div>
  );
}
