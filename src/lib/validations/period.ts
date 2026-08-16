import { z } from "zod";

export const periodEntrySchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    mood: z
      .string()
      .trim()
      .max(100, "Mood is too long")
      .optional(),
    notes: z
      .string()
      .trim()
      .max(2000, "Notes are too long")
      .optional(),
    isPrivate: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const today = new Date();

    today.setHours(23, 59, 59, 999);

    if (data.startDate > today) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Period start date cannot be in the future.",
      });
    }

    if (data.endDate) {
      if (data.endDate < data.startDate) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date cannot be before start date.",
        });
      }

      const periodLength =
        Math.floor(
          (data.endDate.getTime() -
            data.startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      if (periodLength > 15) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "Period length cannot exceed 15 days.",
        });
      }
    }
  });

export type PeriodEntryInput = z.infer<
  typeof periodEntrySchema
>;

export const periodUpdateSchema = z.object({
  endDate: z.coerce.date().optional(),

  mood: z
    .string()
    .trim()
    .max(100, "Mood is too long")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(2000, "Notes are too long")
    .optional(),

  isPrivate: z.boolean().optional(),
});

export type PeriodUpdateInput = z.infer<
  typeof periodUpdateSchema
>;