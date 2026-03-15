import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middlewares/api/require-auth";
import { loadOrganization } from "@/lib/middlewares/api/load-organization";
import { requireOrganizationMember } from "@/lib/middlewares/api/require-organization-member";
import { requireOrganizationAdmin } from "@/lib/middlewares/api/require-organization-admin";
import { inviteMemberSchema } from "../schemas";
import { sendInvitationEmail } from "@/lib/email";
import { isUniqueConstraint } from "@/lib/prisma-errors";

// END OF IMPORTS ------------------------------------------------------------------

const app = new Hono()
  // ************************
  // Lister les invitations
  // ************************
  .get(
    "/",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    requireOrganizationAdmin,
    async (c) => {
      const organization = c.get("organization");

      const invitations = await prisma.organizationInvitation.findMany({
        where: { organizationId: organization.id },
        include: {
          invitedBy: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return c.json({ success: true, data: invitations });
    },
  )

  // ************************
  // Créer une invitation
  // ************************
  .post(
    "/",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    requireOrganizationAdmin,
    zValidator("json", inviteMemberSchema),
    async (c) => {
      const organization = c.get("organization");
      const user = c.get("user");
      const { email, role, expiresInHours } = c.req.valid("json");

      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      const existingMember = await prisma.organizationMember.findFirst({
        where: {
          organizationId: organization.id,
          user: { email },
        },
      });

      if (existingMember) {
        return c.json(
          {
            success: false,
            error: "Cet utilisateur est déjà membre de l'organisation",
          },
          409,
        );
      }

      const pendingInvitation = await prisma.organizationInvitation.findFirst({
        where: {
          organizationId: organization.id,
          email,
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
      });

      if (pendingInvitation) {
        return c.json(
          {
            success: false,
            error: "Une invitation en attente existe déjà pour cet email",
          },
          409,
        );
      }

      try {
        const invitation = await prisma.organizationInvitation.create({
          data: {
            email,
            role,
            expiresAt,
            organizationId: organization.id,
            invitedById: user.id,
          },
        });

        await sendInvitationEmail({
          to: email,
          inviterName: user.name,
          organizationName: organization.name,
          token: invitation.token,
        });

        return c.json({ success: true, data: invitation }, 201);
      } catch (error) {
        if (isUniqueConstraint(error)) {
          return c.json(
            {
              success: false,
              error: "Une invitation pour cet email existe déjà",
            },
            409,
          );
        }
        throw error;
      }
    },
  )

  // ************************
  // Annuler une invitation
  // ************************
  .patch(
    "/:invitationId/cancel",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    requireOrganizationAdmin,
    async (c) => {
      const organization = c.get("organization");
      const { invitationId } = c.req.param();

      const invitation = await prisma.organizationInvitation.findUnique({
        where: { id: invitationId, organizationId: organization.id },
      });

      if (!invitation) {
        return c.json({ success: false, error: "Invitation introuvable" }, 404);
      }

      if (invitation.status !== "PENDING") {
        return c.json(
          {
            success: false,
            error: "Seules les invitations en attente peuvent être annulées",
          },
          409,
        );
      }

      const updated = await prisma.organizationInvitation.update({
        where: { id: invitationId },
        data: { status: "CANCELLED" },
      });

      return c.json({ success: true, data: updated });
    },
  );

export default app;
