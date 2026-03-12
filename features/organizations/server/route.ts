import { sessionMiddleware } from "@/lib/middlewares/session-middleware";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createOrganizationSchema, getOrganizationQuerySchema } from "../schemas";
import { prisma } from "@/lib/prisma";
import { adminSessionMiddleware } from "@/lib/middlewares/admin-session-middleware";
import { organizationSessionMiddleware } from "@/lib/middlewares/organization-session-middleware";
const app = new Hono()
  //******************** */
  //Créer un workspace
  //******************** */
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createOrganizationSchema),
    async (c) => {
      const { name, slug } = c.req.valid("json");
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Utilisateur non trouvé" }, 401);
      }

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

      return c.json({ data: organization });
    }
  )
  //******************** */
  //Récupérer tous les workspaces
  //******************** */
  .get("/", sessionMiddleware, adminSessionMiddleware, async (c, ) => {
    const organizations = await prisma.organization.findMany();
    return c.json({ data: organizations });
  })
  .get(
    "/me",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Utilisateur non trouvé" }, 401);
      }

      const organization = await prisma.organizationMember.findMany({
        where: {
          userId: user.id,
        },
        select: {
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
        },
      });

      return c.json({ data: organization });
    }
  )
  .get(
    "/:organizationSlug",
    sessionMiddleware,
    organizationSessionMiddleware,
    zValidator("query", getOrganizationQuerySchema),
    async (c) => {
      const { organizationSlug } = c.req.param();
      const { includeOwner } = c.req.valid("query");

      // Get optional query parameters for including related data
      const withOrganizationOwnerData = includeOwner || false;

      const organization = await prisma.organization.findUnique({
        where: {
          slug: organizationSlug,
        },
        include: {
          owner: withOrganizationOwnerData,
        },
      });

      return c.json({ data: organization });
    }
  );
export default app;
