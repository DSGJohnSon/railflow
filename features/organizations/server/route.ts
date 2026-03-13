//HONO & ZOD
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createOrganizationSchema } from "../schemas";

//PRISMA
import { prisma } from "@/lib/prisma";

//MIDDLEWARES
import { requireAuth } from "@/lib/middlewares/api/require-auth";
import { isUniqueConstraint } from "@/lib/prisma-errors";

// END OF IMPORTS ------------------------------------------------------------------

const app = new Hono()
  //******************** */
  //Créer une organisation
  //******************** */
  .post(
    "/",
    requireAuth,
    zValidator("json", createOrganizationSchema),
    async (c) => {
      const user = c.get("user");
      const { name, slug } = c.req.valid("json");

      try {
        const organization = await prisma.organization.create({
          data: {
            name,
            slug,
            ownerId: user.id,
            organizationMembers: {
              create: {
                role: "OWNER",
                userId: user.id,
              },
            },
          },
        });
        return c.json({ success: true, data: organization }, 201);
      } catch (error) {
        if (isUniqueConstraint(error)) {
          return c.json(
            { success: false, error: "Ce slug est deja utilise" },
            409,
          );
        }
        throw error;
      }
    },
  );

export default app;
