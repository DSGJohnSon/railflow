import { createMiddleware } from "hono/factory";
import { prisma } from "@/lib/prisma";
import type { AppEnv } from "./app-context";

/**
 * Option B: Access middleware that handles both org members AND external project members.
 * Does NOT require requireOrganizationMember as a prerequisite.
 * The org OWNER is always a ProjectMember (added automatically at project creation).
 *
 * Order of checks:
 * 1. Direct ProjectMember → access with their project role
 * 2. Otherwise → 403
 */
export const requireProjectAccess = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");
  const organization = c.get("organization");
  const project = c.get("project");

  const orgMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    select: { role: true },
  });

  // Check direct project membership (covers org members and external users)
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: user.id,
      },
    },
    select: { role: true },
  });

  if (!projectMember) {
    return c.json({ success: false, error: "Accès refusé au projet" }, 403);
  }

  if (orgMember) {
    c.set("organizationRole", orgMember.role);
  }
  c.set("projectRole", projectMember.role);
  await next();
});
