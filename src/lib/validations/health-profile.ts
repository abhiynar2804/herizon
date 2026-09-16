import { z } from "zod";

export const healthProfileSchema = z.object({
  dateOfBirth: z.coerce.date().refine((dateOfBirth) => {
    const latestAllowedBirthDate = new Date();
    latestAllowedBirthDate.setUTCHours(0, 0, 0, 0);
    latestAllowedBirthDate.setUTCFullYear(
      latestAllowedBirthDate.getUTCFullYear() - 18,
    );

    return dateOfBirth <= latestAllowedBirthDate;
  }, "You must be at least 18 years old"),

  heightCm: z
    .number()
    .int()
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height must be at most 250 cm"),

  weightKg: z
    .number()
    .min(25, "Weight must be at least 25 kg")
    .max(300, "Weight must be at most 300 kg"),

  bloodGroup: z.string().trim().max(10, "Invalid blood group").optional(),

  allergies: z
    .string()
    .trim()
    .max(1000, "Allergies information is too long")
    .optional(),

  medicalConditions: z
    .string()
    .trim()
    .max(1000, "Medical conditions information is too long")
    .optional(),

  emergencyContactName: z
    .string()
    .trim()
    .max(100, "Emergency contact name is too long")
    .optional(),

  emergencyContactPhone: z
    .string()
    .trim()
    .max(20, "Emergency contact phone is too long")
    .optional(),

  lastPeriodDate: z.coerce.date().optional(),

  averageCycleLength: z
    .number()
    .int()
    .min(15, "Cycle length must be at least 15 days")
    .max(90, "Cycle length must be at most 90 days")
    .optional(),

  averagePeriodLength: z
    .number()
    .int()
    .min(1, "Period length must be at least 1 day")
    .max(15, "Period length must be at most 15 days")
    .optional(),
});

export type HealthProfileInput = z.infer<typeof healthProfileSchema>;
