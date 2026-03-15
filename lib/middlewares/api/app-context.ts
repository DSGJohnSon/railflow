import type { Role, ProjectRole } from "@prisma/client";

export type AppVariables = {
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
  organization: {
    id: string;
    slug: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  organizationRole: Role;
  project: {
    id: string;
    slug: string;
    name: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  projectRole: ProjectRole;
};

export type AppEnv = {
  Variables: AppVariables;
};