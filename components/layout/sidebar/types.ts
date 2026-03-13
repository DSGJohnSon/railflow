import type { User } from "better-auth";

export type SidebarUser = Pick<User, "name" | "email" | "image">;
