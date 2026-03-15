import z from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Le slug doit contenir uniquement des lettres minuscules, des chiffres et des tirets (ex: mon-organisation)",
    }),
});

export const INVITATION_EXPIRY_OPTIONS = [
  { label: "1 heure", value: 1 },
  { label: "24 heures", value: 24 },
  { label: "3 jours", value: 72 },
  { label: "7 jours", value: 168 },
] as const;

export const inviteMemberSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  role: z.enum(["ADMIN", "MEMBER"], {
    message: "Le rôle doit être ADMIN ou MEMBER",
  }),
  expiresInHours: z.number().refine(
    (v) => INVITATION_EXPIRY_OPTIONS.some((o) => o.value === v),
    { message: "Durée d'expiration invalide" }
  ),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"], {
    message: "Le rôle doit être ADMIN ou MEMBER",
  }),
});
