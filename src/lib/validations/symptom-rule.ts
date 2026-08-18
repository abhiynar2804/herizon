import { z } from "zod";

export const symptomRuleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Rule title must be at least 2 characters")
    .max(150, "Rule title is too long"),

  recommendation: z
    .string()
    .trim()
    .min(10, "Recommendation must be at least 10 characters")
    .max(2000, "Recommendation is too long"),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),

  isEmergency: z.boolean().optional(),

  isActive: z.boolean().optional(),

  symptomIds: z
    .array(z.string().min(1))
    .min(1, "At least one symptom is required"),
});

export type SymptomRuleInput = z.infer<typeof symptomRuleSchema>;