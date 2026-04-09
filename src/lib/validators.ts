import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Adj meg egy valós email címet."),
  password: z.string().min(8, "A jelszó legalább 8 karakter legyen.")
});

export const registerSchema = z.object({
  name: z.string().min(2, "A név legalább 2 karakter legyen."),
  username: z
    .string()
    .min(3, "A felhasználónév legalább 3 karakter legyen.")
    .regex(/^[a-z0-9_]+$/, "Csak kisbetű, szám és aláhúzás használható."),
  email: z.string().email("Adj meg egy valós email címet."),
  password: z.string().min(8, "A jelszó legalább 8 karakter legyen.")
});

export const reviewSchema = z.object({
  subjectId: z.string().cuid(),
  title: z.string().min(4, "Adj egy rövid, de értelmes címet."),
  content: z.string().min(30, "Írj legalább 30 karakteres tapasztalatot."),
  difficultyRating: z.coerce.number().int().min(1).max(10),
  usefulnessRating: z.coerce.number().int().min(1).max(10),
  teacherName: z.string().max(120).optional().or(z.literal("")),
  semesterTaken: z.string().max(40).optional().or(z.literal("")),
  passedFirstTry: z.boolean().optional(),
  wouldRecommend: z.boolean().optional()
});

export const examTipSchema = z.object({
  subjectId: z.string().cuid(),
  content: z.string().min(10, "A tipp legyen legalább 10 karakter.")
});

export const resourceSchema = z.object({
  subjectId: z.string().cuid(),
  title: z.string().min(3, "Adj címet a forrásnak."),
  description: z.string().max(280).optional().or(z.literal("")),
  url: z.string().url("Adj meg egy érvényes linket."),
  type: z.enum(["PDF", "DRIVE", "DOC", "ARTICLE", "OTHER"])
});

export const commentSchema = z.object({
  subjectId: z.string().cuid().optional(),
  reviewId: z.string().cuid().optional(),
  content: z.string().min(3, "A komment túl rövid.").max(500)
});

export const bookmarkSchema = z.object({
  subjectId: z.string().cuid()
});

export const voteSchema = z.object({
  targetType: z.enum(["REVIEW", "NOTE_RESOURCE", "EXAM_TIP", "COMMENT"]),
  targetId: z.string().cuid(),
  value: z.union([z.literal(1), z.literal(-1)])
});

export const reportSchema = z.object({
  targetType: z.enum(["REVIEW", "NOTE_RESOURCE", "EXAM_TIP", "COMMENT", "SUBJECT", "USER"]),
  targetId: z.string().cuid(),
  reason: z.string().min(6, "Írj legalább 6 karakteres indokot.").max(280)
});

export const profileSettingsSchema = z.object({
  name: z.string().min(2, "A név legalább 2 karakter legyen."),
  username: z
    .string()
    .min(3, "A felhasználónév legalább 3 karakter legyen.")
    .regex(/^[a-z0-9_]+$/, "Csak kisbetű, szám és aláhúzás használható."),
  bio: z.string().max(280, "A bio legfeljebb 280 karakter lehet.").optional().or(z.literal("")),
  image: z.string().refine((value) => value === "" || value.startsWith("/uploads/avatars/"), "Csak feltöltött profilképet használj."),
  universityId: z.string().cuid().optional().or(z.literal("")),
  programId: z.string().cuid().optional().or(z.literal(""))
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Add meg a jelenlegi jelszavadat."),
    newPassword: z.string().min(8, "Az új jelszó legalább 8 karakter legyen."),
    confirmPassword: z.string().min(8, "Erősítsd meg az új jelszót.")
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "A két új jelszó nem egyezik.",
    path: ["confirmPassword"]
  });
