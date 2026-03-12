import "server-only";
import { createMiddleware } from "hono/factory";
import { prisma } from "../prisma";
import { Role } from "@prisma/client";

type AdditionalContext = {
  Variables: {
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
    organizationRole: Role;
  };
};

export const organizationSessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const user = c.get("user");
    const organizationId = c.req.param("id");
  
    if (!user) {
      return c.json({ error: "Non autorisé" }, 401);
    }

    if (!organizationId) {
       return c.json({ error: "ID d'organisation manquant" }, 400);
    }
    
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: user.id,
      },
    });

    if (!member && !user.isSuperAdmin) {
      console.log(`L'utilisateur ${user.email} a tenté d'accéder à l'organisation ${organizationId} sans être membre.`);
      return c.json({ error: "Accès refusé - Vous n'êtes pas membre de cette organisation" }, 403);
    }

    // On stocke le rôle en bonus dans le contexte
    if (member) {
        c.set("organizationRole", member.role);
    } else if (user.isSuperAdmin) {
        // Un super admin qui n'est pas membre est considéré comme ADMIN d'office pour les opérations
        c.set("organizationRole", "ADMIN");
    }

    await next();
  }
);
