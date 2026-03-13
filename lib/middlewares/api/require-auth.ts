import "server-only";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { auth } from "../../auth";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { AppEnv } from "./app-context";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const sessionToken = getCookie(c, AUTH_COOKIE);

  if (!sessionToken) {
    return c.json(
      { success: false, error: "Non autorisé - Session non trouvée" },
      401,
    );
  }

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({success: false, error: "Non autorisé - Session invalide" }, 401);
  }

  c.set("user", {
    ...session.user,
    isSuperAdmin: !!session.user.isSuperAdmin,
  });
  c.set("session", session.session);
  await next();
});
