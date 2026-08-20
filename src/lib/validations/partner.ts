import { z } from "zod";

export const partnerInviteSchema = z.object({
  email: z.string().trim().email("Invalid partner email."),
});

export const partnerSharingSchema = z.object({
  shareCyclePhase: z.boolean(),
  shareNextPeriod: z.boolean(),
  shareMood: z.boolean(),
  shareCareSuggestions: z.boolean(),
  shareReminders: z.boolean(),
});

export type PartnerInviteInput = z.infer<
  typeof partnerInviteSchema
>;

export type PartnerSharingInput = z.infer<
  typeof partnerSharingSchema
>;