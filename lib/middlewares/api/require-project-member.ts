import { createMiddleware } from "hono/factory";
import { prisma } from "@/lib/prisma";
import type { AppEnv } from "./app-context";

export const requireProjectMember = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");
  const project = c.get("project");

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: user.id,
      },
    },
  });

  if (!member) {
    return c.json({ success: false, error: "Accès refusé au projet" }, 403);
  }

  c.set("projectRole", member.role);
  await next();
});
