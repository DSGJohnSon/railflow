import { Hono } from "hono";
import { handle } from "hono/vercel";

import organizations from "@/features/organizations/server/route";

const app = new Hono().basePath("/api");

const routes = app
	.route("/organizations", organizations)

export const GET = handle(routes);
export const POST = handle(routes);
export const PUT = handle(routes);
export const PATCH = handle(routes);
export const DELETE = handle(routes);

export type AppType = typeof routes;
