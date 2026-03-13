import "server-only";
import { createMiddleware } from "hono/factory";
import { AppEnv } from "./app-context";
import { prisma } from "@/lib/prisma";

export const requireOrganizationMember = createMiddleware<AppEnv>(
  async (c, next) => {
    const organization = c.get("organization");
    const user = c.get("user");

    if (!organization) {
      return c.json(
        { success: false, error: "Non autorisé - Organisation non trouvée" },
        401,
      );
    }

    const organizationMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!organizationMember) {
      return c.json(
        {
          success: false,
          error: "Accès refusé - Vous n'êtes pas membre de cette organisation",
        },
        403,
      );
    }

    const organizationRole = organizationMember.role;

    if (!organizationRole) {
      return c.json(
        {
          success: false,
          error:
            "Accès refusé - Vous n'avez pas de rôle dans cette organisation",
        },
        403,
      );
    }

    c.set("organizationRole", organizationRole);

    await next();
  },
);
