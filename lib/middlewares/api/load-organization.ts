import "server-only";
import { createMiddleware } from "hono/factory";
import { AppEnv } from "./app-context";
import { prisma } from "../../prisma";

export const loadOrganization = createMiddleware<AppEnv>(async (c, next) => {
  const organizationSlug = c.req.param("organizationSlug");

  if (!organizationSlug) {
    return c.json(
      { success: false, error: "Organisation non trouvée - Slug Manquant" },
      404,
    );
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
    select: {
      id: true,
      slug: true,
      name: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!organization) {
    return c.json(
      { success: false, error: "Organisation non trouvée - Slug Invalide" },
      404,
    );
  }

  c.set("organization", organization);

  await next();
});
