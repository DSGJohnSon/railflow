import { Hono } from "hono";
import { handle } from "hono/vercel";

import organizations from "@/features/organizations/server/route";
import organizationsMeRoutes from "@/features/organizations/server/me-route";
import organizationsMembers from "@/features/organizations/server/members-route";
import organizationsInvitations from "@/features/organizations/server/invitations-route";
import projects from "@/features/projects/server/route";
import projectsMeRoutes from "@/features/projects/server/me-route";
import invitations from "@/features/invitations/server/route";

const app = new Hono().basePath("/api");

const routes = app
  .route("/organizations", organizations)
  .route("/users/me/organizations", organizationsMeRoutes)
  .route("/organizations/:organizationSlug/members", organizationsMembers)
  .route("/organizations/:organizationSlug/invitations", organizationsInvitations)
  .route("/organizations/:organizationSlug/projects", projects)
  .route("/users/me/projects", projectsMeRoutes)
  .route("/invitations", invitations)
  
  .notFound((c) => {
    console.log(c.req.path);
    return c.json({success: false, error: "Route non trouvee" }, 404);
  })
  .onError((err, c) => {
    console.error(err);
    return c.json({success: false, error: "Erreur serveur" }, 500);
  });

export const GET = handle(routes);
export const POST = handle(routes);
export const PUT = handle(routes);
export const PATCH = handle(routes);
export const DELETE = handle(routes);

export type AppType = typeof routes;
