import { Hono } from "hono";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middlewares/api/require-auth";

// END OF IMPORTS ------------------------------------------------------------------

const app = new Hono()
  // ************************
  // Récupérer les détails d'une invitation (public)
  // ************************
  .get("/:token", async (c) => {
    const { token } = c.req.param();

    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        invitedBy: { select: { id: true, name: true, image: true } },
      },
    });

    if (!invitation) {
      return c.json({ success: false, error: "Invitation introuvable" }, 404);
    }

    const isExpired =
      invitation.status === "PENDING" && invitation.expiresAt < new Date();

    if (isExpired) {
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: "CANCELLED" },
      });
      return c.json({
        success: true,
        data: { ...invitation, status: "CANCELLED" as const },
      });
    }

    return c.json({ success: true, data: invitation });
  })

  // ************************
  // Accepter une invitation (auth requise)
  // ************************
  .post("/:token/accept", requireAuth, async (c) => {
    const { token } = c.req.param();
    const user = c.get("user");

    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!invitation) {
      return c.json({ success: false, error: "Invitation introuvable" }, 404);
    }

    if (invitation.status === "ACCEPTED") {
      return c.json(
        { success: false, error: "Cette invitation a déjà été acceptée" },
        409,
      );
    }

    if (invitation.status === "CANCELLED" || invitation.expiresAt < new Date()) {
      return c.json(
        { success: false, error: "Cette invitation a expiré ou a été annulée" },
        410,
      );
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return c.json(
        {
          success: false,
          error: "Vous êtes déjà membre de cette organisation",
          data: { organizationSlug: invitation.organization.slug },
        },
        409,
      );
    }

    await prisma.$transaction([
      prisma.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId: user.id,
          role: invitation.role,
        },
      }),
      prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    return c.json({
      success: true,
      data: { organizationSlug: invitation.organization.slug },
    });
  });

export default app;
