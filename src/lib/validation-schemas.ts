/**
 * Schémas de validation Zod réutilisables
 */

import { z } from "zod";

// ============================================
// SCHÉMAS DE BASE
// ============================================

export const emailSchema = z
  .string()
  .email("Email invalide")
  .min(3, "Email trop court")
  .max(255, "Email trop long")
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(100, "Mot de passe trop long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
  );

export const nameSchema = z
  .string()
  .min(1, "Nom requis")
  .max(100, "Nom trop long")
  .trim();

export const slugSchema = z
  .string()
  .min(2, "Slug trop court")
  .max(100, "Slug trop long")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug invalide (lettres minuscules, chiffres et tirets uniquement)"
  )
  .trim();

export const uuidSchema = z.string().uuid("ID invalide");

export const phoneSchema = z
  .string()
  .regex(/^[\d+\-\s()]{8,20}$/, "Numéro de téléphone invalide")
  .optional();

export const urlSchema = z
  .string()
  .url("URL invalide")
  .max(2000, "URL trop longue")
  .optional();

export const badgeSchema = z
  .string()
  .regex(/^[A-Z0-9-]{1,20}$/, "Badge invalide")
  .optional();

export const ibanSchema = z
  .string()
  .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/, "IBAN invalide")
  .length(27, "IBAN doit contenir 27 caractères")
  .optional();

export const bicSchema = z
  .string()
  .regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, "BIC invalide")
  .min(8, "BIC trop court")
  .max(11, "BIC trop long")
  .optional();

export const postalCodeSchema = z
  .string()
  .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)")
  .optional();

// ============================================
// SCHÉMAS DATES
// ============================================

export const dateSchema = z
  .string()
  .or(z.date())
  .transform((val) => {
    if (val instanceof Date) return val;
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error("Date invalide");
    return date;
  });

export const futureDateSchema = dateSchema.refine(
  (date) => date > new Date(),
  "La date doit être dans le futur"
);

export const pastDateSchema = dateSchema.refine(
  (date) => date < new Date(),
  "La date doit être dans le passé"
);

// ============================================
// SCHÉMAS NUMÉRIQUES
// ============================================

export const positiveIntSchema = z
  .number()
  .int("Doit être un entier")
  .positive("Doit être positif");

export const nonNegativeIntSchema = z
  .number()
  .int("Doit être un entier")
  .nonnegative("Doit être positif ou zéro");

export const amountSchema = z
  .number()
  .nonnegative("Le montant doit être positif")
  .max(999999999, "Montant trop élevé");

export const percentageSchema = z
  .number()
  .min(0, "Pourcentage minimum 0")
  .max(100, "Pourcentage maximum 100");

export const hourSchema = z
  .number()
  .min(0, "Heures minimum 0")
  .max(24, "Heures maximum 24");

// ============================================
// SCHÉMAS ENUMS
// ============================================

export const roleSchema = z.enum(["USER", "MANAGER", "ADMIN", "SUPER_ADMIN"], {
  errorMap: () => ({ message: "Rôle invalide" }),
});

export const statusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"], {
  errorMap: () => ({ message: "Statut invalide" }),
});

export const fmpaTypeSchema = z.enum(
  ["FORMATION", "MANOEUVRE", "PREVENTION", "AUTRE"],
  { errorMap: () => ({ message: "Type FMPA invalide" }) }
);

export const ttaStatusSchema = z.enum(
  ["PENDING", "VALIDATED", "REJECTED", "EXPORTED"],
  {
    errorMap: () => ({ message: "Statut TTA invalide" }),
  }
);

// ============================================
// SCHÉMAS COMPLEXES
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const searchSchema = z.object({
  query: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(
    (data) => data.endDate >= data.startDate,
    "La date de fin doit être après la date de début"
  );

export const addressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  postalCode: postalCodeSchema.unwrap(),
  country: z.string().min(2).max(100).default("France"),
});

// ============================================
// SCHÉMAS UTILISATEUR
// ============================================

export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  tenantSlug: slugSchema,
});

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mot de passe requis"),
});

export const updateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  avatar: urlSchema,
});

export const updateUserRoleSchema = z.object({
  role: roleSchema,
});

// ============================================
// SCHÉMAS FMPA
// ============================================

const baseFmpaSchema = z.object({
  title: z.string().min(3, "Titre trop court").max(200, "Titre trop long"),
  description: z.string().max(5000, "Description trop longue").optional(),
  type: fmpaTypeSchema,
  startDate: dateSchema,
  endDate: dateSchema,
  location: z.string().min(1).max(200),
  maxParticipants: positiveIntSchema.optional(),
  requiredQualifications: z.array(uuidSchema).max(50).optional(),
});

export const createFmpaSchema = baseFmpaSchema.refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "La date de fin doit être après la date de début",
    path: ["endDate"],
  }
);

export const updateFmpaSchema = baseFmpaSchema.partial();

export const registerFmpaSchema = z.object({
  userId: uuidSchema,
  role: z.string().max(100).optional(),
});

// ============================================
// SCHÉMAS FORMATION
// ============================================

const baseFormationSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  location: z.string().min(1).max(200),
  maxParticipants: positiveIntSchema.optional(),
  instructor: z.string().max(200).optional(),
  cost: amountSchema.optional(),
});

export const createFormationSchema = baseFormationSchema.refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "La date de fin doit être après la date de début",
    path: ["endDate"],
  }
);

export const updateFormationSchema = baseFormationSchema.partial();

// ============================================
// SCHÉMAS TTA
// ============================================

export const createTtaEntrySchema = z.object({
  date: dateSchema,
  hours: hourSchema,
  minutes: z.number().min(0).max(59),
  activity: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export const updateTtaEntrySchema = createTtaEntrySchema.partial();

export const validateTtaEntrySchema = z.object({
  status: z.enum(["VALIDATED", "REJECTED"]),
  comment: z.string().max(500).optional(),
});

export const exportTtaSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  format: z.enum(["CSV", "SEPA"]),
});

// ============================================
// SCHÉMAS PERSONNEL
// ============================================

export const createPersonnelSchema = z.object({
  userId: uuidSchema,
  badge: badgeSchema.unwrap(),
  grade: z.string().max(100),
  service: z.string().max(100),
  status: z.enum(["ACTIVE", "INACTIVE", "LEAVE"]),
  hireDate: dateSchema,
});

export const updatePersonnelSchema = createPersonnelSchema
  .partial()
  .omit({ userId: true });

export const updateMedicalStatusSchema = z.object({
  status: z.enum(["FIT", "UNFIT", "LIMITED"]),
  expiryDate: dateSchema.optional(),
  restrictions: z.string().max(1000).optional(),
});

// ============================================
// SCHÉMAS MESSAGES
// ============================================

export const createMessageSchema = z.object({
  conversationId: uuidSchema,
  content: z.string().min(1, "Message vide").max(5000, "Message trop long"),
  type: z.enum(["TEXT", "IMAGE", "FILE"]).default("TEXT"),
});

export const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: z.enum(["DIRECT", "GROUP"]),
  participantIds: z.array(uuidSchema).min(1).max(100),
});

// ============================================
// HELPERS
// ============================================

/**
 * Valider et parser des données avec un schéma Zod
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Formater les erreurs Zod pour l'API
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    formatted[path] = err.message;
  });

  return formatted;
}
