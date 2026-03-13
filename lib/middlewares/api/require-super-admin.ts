import "server-only";
import { createMiddleware } from "hono/factory";
import { AppEnv } from "./app-context";

export const requireSuperAdmin = createMiddleware<AppEnv>(
  async (c, next) => {
    const user = c.get("user");
  
    if (!user) {
      return c.json({success: false, error: "Non autorisé - Utilisateur non trouvé" }, 401);
    }

    if (!user.isSuperAdmin) {
      return c.json({success: false, error: "Accès refusé - Droits 'Super-Administrateur' requis" }, 403);
    }

    await next();
  }
);
