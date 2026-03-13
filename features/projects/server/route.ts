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
      const { name, slug, description } = c.req.valid("json");

      try {
        const project = await prisma.project.create({
          data: {
            name,
            slug,
            description: description ?? "",
            ownerId: user.id,
            organizationId: organization.id,
            projectMembers: {
              create: {
                role: "OWNER",
                userId: user.id,
              },
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
