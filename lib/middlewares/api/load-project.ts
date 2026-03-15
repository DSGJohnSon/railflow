import { createMiddleware } from "hono/factory";
import { prisma } from "@/lib/prisma";
import type { AppEnv } from "./app-context";

export const loadProject = createMiddleware<AppEnv>(async (c, next) => {
  const organization = c.get("organization");
  const projectSlug = c.req.param("projectSlug");

  if (!projectSlug) {
    return c.json({ success: false, error: "Slug du projet manquant" }, 400);
  }

  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      organizationId: organization.id,
    },
  });

  if (!project) {
    return c.json({ success: false, error: "Projet introuvable" }, 404);
  }

  c.set("project", project);
  await next();
});
