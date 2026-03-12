import "server-only";
import { createMiddleware } from "hono/factory";

type AdditionalContext = {
  Variables: {
    user: {
      id: string;
      email: string;
      name: string;
      emailVerified: boolean;
      image?: string | null;
      isSuperAdmin: boolean;
    };
    session: {
      id: string;
      expiresAt: Date;
    };
  };
};

export const adminSessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const user = c.get("user");
  
    if (!user) {
      return c.json({ error: "Non autorisé" }, 401);
    }

    if (!user.isSuperAdmin) {
      console.log(`L'utilisateur ${user.email} a tenté d'accéder à une route admin sans les droits.`);
      return c.json({ error: "Accès refusé - Droits administrateur requis" }, 403);
    }

    await next();
  }
);
