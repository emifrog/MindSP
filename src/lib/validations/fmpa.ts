import { z } from "zod";

export const createFMPASchema = z.object({
  type: z.enum(["FORMATION", "MANOEUVRE", "PRESENCE_ACTIVE"]),
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().min(1, "Le lieu est requis"),
  maxParticipants: z.number().int().positive().optional().nullable(),
  requiresApproval: z.boolean().default(false),
  instructors: z.string().optional().nullable(),
  equipment: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
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
