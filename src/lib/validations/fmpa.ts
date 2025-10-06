import { z } from "zod";

export const createFMPASchema = z.object({
  type: z.enum(["FORMATION", "MANOEUVRE", "PRESENCE_ACTIVE"]),
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().min(1, "Le lieu est requis"),
  maxParticipants: z.number().int().positive().optional(),
  requiresApproval: z.boolean().default(false),
  instructors: z.string().optional(),
  equipment: z.string().optional(),
  objectives: z.string().optional(),
});

export const updateFMPASchema = createFMPASchema.partial().extend({
  status: z
    .enum(["DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
});

export const registerFMPASchema = z.object({
  fmpaId: z.string().uuid(),
  notes: z.string().optional(),
});

export type CreateFMPAInput = z.infer<typeof createFMPASchema>;
export type UpdateFMPAInput = z.infer<typeof updateFMPASchema>;
export type RegisterFMPAInput = z.infer<typeof registerFMPASchema>;
