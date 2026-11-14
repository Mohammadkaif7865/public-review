import { z } from "zod";

export const reviewSubmissionSchema = z.object({
  entityId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(20).max(10_000),
  firstHandExperience: z.literal(true),
  publicDisplayMode: z.enum(["profile_name", "anonymous"]),
  experienceDate: z.iso.date().optional(),
});

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;

