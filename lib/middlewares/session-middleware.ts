import "server-only";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { auth } from "../auth";
import { AUTH_COOKIE } from "@/features/auth/constants";

type AdditionalContext = {
  Variables: {
    user: {
      id: string;
      email: string;
      name: string;
      emailVerified: boolean;
      image?: string | null;
    };
    session: {
      id: string;
      expiresAt: Date;
    };
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const sessionToken = getCookie(c, AUTH_COOKIE);
  
    if (!sessionToken) {
      console.log("Session non trouvée");
      console.log(sessionToken);
      return c.json({ error: "Non autorisé" }, 401);
    }

    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      console.log("Session invalide");
      return c.json({ error: "Session invalide" }, 401);
    }

    c.set("user", session.user);
    c.set("session", session.session);
    await next();
  }
);
