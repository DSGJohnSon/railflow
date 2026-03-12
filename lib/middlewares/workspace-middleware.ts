import "server-only";
import type { Prisma } from "@prisma/client";
import { createMiddleware } from "hono/factory";
import { prisma } from "../prisma";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
};

type WorkspaceWithMembers = Prisma.WorkspaceGetPayload<{
  include: { members: true };
}>;

type AppEnv = {
  Variables: {
    user: SessionUser;
    session: {
      id: string;
      expiresAt: Date;
    };
    workspace: WorkspaceWithMembers;
  };
};

const loadWorkspaceAndCheckMembership = async (
  c: any,
  workspaceId: string
) => {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      members: true,
    },
  });

  //Pas de workspace trouvé :
  if (!workspace) {
    console.log("Workspace non trouvé");
    return c.json({ error: "Workspace non trouvé" }, 404);
  }

  //Vérifier si l'utilisateur est membre du workspace :
  const user = c.get("user");
  const isMember = workspace.members.some((member) => member.userId === user.id);

  if (!isMember) {
    return c.json(
      { error: "Non autorisé, vous n'êtes pas membre de ce workspace" },
      401
    );
  }

  c.set("workspace", workspace);
};

export const workspaceMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const workspaceId = c.req.param("workspaceId");

  //Pas de workspace ID fourni :
  if (!workspaceId) {
    return c.json({ error: "Workspace ID manquant" }, 400);
  }

  const maybeErrorResponse = await loadWorkspaceAndCheckMembership(c, workspaceId);
  if (maybeErrorResponse) return maybeErrorResponse;
  await next();
});

export const workspaceOwnerMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const workspace = c.get("workspace");
  const user = c.get("user");

  if (!workspace) {
    console.log("Workspace non trouvé");
    return c.json({ error: "Workspace non trouvé" }, 404);
  }

  if (workspace.ownerId !== user.id) {
    console.log("Non autorisé, vous n'êtes pas propriétaire de ce workspace");
    return c.json({ error: "Non autorisé, vous n'êtes pas propriétaire de ce workspace" }, 401);
  }

  await next();
});
