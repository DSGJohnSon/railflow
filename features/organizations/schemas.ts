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

export const getOrganizationQuerySchema = z.object({
  includeOwner: z.union([z.boolean(), z.string()]).transform((v) => v === true || v === "true"),
});
