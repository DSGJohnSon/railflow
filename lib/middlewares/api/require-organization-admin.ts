import "server-only";
import { createMiddleware } from "hono/factory";
import { AppEnv } from "./app-context";

export const requireOrganizationAdmin = createMiddleware<AppEnv>(
  async (c, next) => {
    const role = c.get("organizationRole");

    if (!role || !["ADMIN", "OWNER"].includes(role)) {
      return c.json({ success: false, error: "Accès refusé - Vous n'avez pas les droits d'administrateur dans cette organisation" }, 403);
    }

    await next();
  },
);
