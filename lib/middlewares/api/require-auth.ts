import "server-only";
import { createMiddleware } from "hono/factory";
import { auth } from "../../auth";
import { AppEnv } from "./app-context";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json(
      { success: false, error: "Non autorise - Session absente ou invalide" },
      401,
    );
  }

  c.set("user", {
    ...session.user,
    isSuperAdmin: !!session.user.isSuperAdmin,
  });
  c.set("session", session.session);
  await next();
});
