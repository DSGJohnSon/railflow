import { hc } from "hono/client";
import { AppType } from "@/app/api/[[...route]]/route";

// Keep RPC calls same-origin so auth cookies are sent in every environment.
export const client = hc<AppType>("/");
