import { createMiddleware } from "hono/factory";
import type { AppEnv } from "./app-context";

export const requireProjectAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const projectRole = c.get("projectRole");

  if (projectRole !== "ADMIN") {
    return c.json({ success: false, error: "Accès refusé : rôle administrateur requis" }, 403);
  }

  await next();
});
