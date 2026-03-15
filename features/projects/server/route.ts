//HONO & ZOD
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createProjectSchema } from "../schemas";

//PRISMA
import { prisma } from "@/lib/prisma";

//MIDDLEWARES
import { requireAuth } from "@/lib/middlewares/api/require-auth";
import { loadOrganization } from "@/lib/middlewares/api/load-organization";
import { requireOrganizationMember } from "@/lib/middlewares/api/require-organization-member";
import { requireOrganizationAdmin } from "@/lib/middlewares/api/require-organization-admin";
import { isUniqueConstraint } from "@/lib/prisma-errors";

// END OF IMPORTS ------------------------------------------------------------------

const app = new Hono()
  //******************** */
  //Créer un project
  //******************** */
  .post(
    "/",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    requireOrganizationAdmin,
    zValidator("json", createProjectSchema),
    async (c) => {
      const user = c.get("user");
      const organization = c.get("organization");
      const { name, slug, description, initialMembers } = c.req.valid("json");

      // S'assure que les userId de initialMembers sont bien membres de l'org
      const orgMemberIds = new Set(
        (
          await prisma.organizationMember.findMany({
            where: { organizationId: organization.id },
            select: { userId: true },
          })
        ).map((m) => m.userId),
      );

      const validMembers = (initialMembers ?? []).filter(
        (m) => orgMemberIds.has(m.userId) && m.userId !== user.id && m.userId !== organization.ownerId,
      );

      // Le owner de l'org est toujours ajouté en ADMIN (sauf s'il est le créateur)
      const ownerEntry =
        organization.ownerId !== user.id
          ? [{ role: "ADMIN" as const, userId: organization.ownerId }]
          : [];

      try {
        const project = await prisma.project.create({
          data: {
            name,
            slug,
            description: description ?? "",
            organizationId: organization.id,
            projectMembers: {
              create: [
                { role: "ADMIN", userId: user.id },
                ...ownerEntry,
                ...validMembers.map((m) => ({ role: m.role, userId: m.userId })),
              ],
            },
          },
        });
        return c.json({ success: true, data: project }, 201);
      } catch (error) {
        if (isUniqueConstraint(error)) {
          return c.json(
            { success: false, error: "Ce slug est deja utilisé" },
            409,
          );
        }
        throw error;
      }
    },
  );
export default app;
