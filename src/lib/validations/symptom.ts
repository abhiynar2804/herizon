import { z } from "zod";

export const symptomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Symptom name must be at least 2 characters")
    .max(100, "Symptom name is too long"),

  description: z
    .string()
    .trim()
    .max(1000, "Description is too long")
    .optional(),

  severity: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),

  isActive: z.boolean().optional(),
});

export type SymptomInput = z.infer<typeof symptomSchema>;