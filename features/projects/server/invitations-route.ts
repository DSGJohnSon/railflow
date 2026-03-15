import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middlewares/api/require-auth";
import { loadOrganization } from "@/lib/middlewares/api/load-organization";
import { requireOrganizationMember } from "@/lib/middlewares/api/require-organization-member";
import { loadProject } from "@/lib/middlewares/api/load-project";
import { requireProjectMember } from "@/lib/middlewares/api/require-project-member";
import { requireProjectAdmin } from "@/lib/middlewares/api/require-project-admin";
import { inviteProjectMemberSchema } from "../schemas";
import { sendProjectInvitationEmail } from "@/lib/email";
import { isUniqueConstraint } from "@/lib/prisma-errors";

// END OF IMPORTS ------------------------------------------------------------------

const app = new Hono()
  // ************************
  // Lister les invitations d'un projet
  // ************************
  .get(
    "/",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    loadProject,
    requireProjectMember,
    requireProjectAdmin,
    async (c) => {
      const project = c.get("project");

      const invitations = await prisma.projectInvitation.findMany({
        where: { projectId: project.id },
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
  // Créer une invitation de projet
  // ************************
  .post(
    "/",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    loadProject,
    requireProjectMember,
    requireProjectAdmin,
    zValidator("json", inviteProjectMemberSchema),
    async (c) => {
      const organization = c.get("organization");
      const project = c.get("project");
      const user = c.get("user");
      const { email, role, expiresInHours } = c.req.valid("json");

      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      const existingMember = await prisma.projectMember.findFirst({
        where: {
          projectId: project.id,
          user: { email },
        },
      });

      if (existingMember) {
        return c.json(
          { success: false, error: "Cet utilisateur est déjà membre du projet" },
          409,
        );
      }

      const pendingInvitation = await prisma.projectInvitation.findFirst({
        where: {
          projectId: project.id,
          email,
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
      });

      if (pendingInvitation) {
        return c.json(
          { success: false, error: "Une invitation en attente existe déjà pour cet email" },
          409,
        );
      }

      try {
        const invitation = await prisma.projectInvitation.create({
          data: {
            email,
            role,
            expiresAt,
            projectId: project.id,
            invitedById: user.id,
          },
        });

        await sendProjectInvitationEmail({
          to: email,
          inviterName: user.name,
          organizationName: organization.name,
          organizationSlug: organization.slug,
          projectName: project.name,
          projectSlug: project.slug,
          token: invitation.token,
        });

        return c.json({ success: true, data: invitation }, 201);
      } catch (error) {
        if (isUniqueConstraint(error)) {
          return c.json(
            { success: false, error: "Une invitation pour cet email existe déjà" },
            409,
          );
        }
        throw error;
      }
    },
  )

  // ************************
  // Annuler une invitation de projet
  // ************************
  .patch(
    "/:invitationId/cancel",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    loadProject,
    requireProjectMember,
    requireProjectAdmin,
    async (c) => {
      const project = c.get("project");
      const { invitationId } = c.req.param();

      const invitation = await prisma.projectInvitation.findUnique({
        where: { id: invitationId, projectId: project.id },
      });

      if (!invitation) {
        return c.json({ success: false, error: "Invitation introuvable" }, 404);
      }

      if (invitation.status !== "PENDING") {
        return c.json(
          { success: false, error: "Seules les invitations en attente peuvent être annulées" },
          409,
        );
      }

      const updated = await prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: "CANCELLED" },
      });

      return c.json({ success: true, data: updated });
    },
  );

export default app;
