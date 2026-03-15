import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middlewares/api/require-auth";
import { loadOrganization } from "@/lib/middlewares/api/load-organization";

// END OF IMPORTS ------------------------------------------------------------------

const app = new Hono()
  // ************************
  // Récupérer les détails d'une invitation de projet (public)
  // ************************
  .get(
    "/",
    loadOrganization,
    zValidator("query", z.object({ token: z.string() })),
    async (c) => {
      const organization = c.get("organization");
      const { token } = c.req.valid("query");

      const invitation = await prisma.projectInvitation.findUnique({
        where: { token },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
              organizationId: true,
            },
          },
          invitedBy: { select: { id: true, name: true, image: true } },
        },
      });

      if (!invitation || invitation.project.organizationId !== organization.id) {
        return c.json({ success: false, error: "Invitation introuvable" }, 404);
      }

      const isExpired =
        invitation.status === "PENDING" && invitation.expiresAt < new Date();

      if (isExpired) {
        await prisma.projectInvitation.update({
          where: { id: invitation.id },
          data: { status: "CANCELLED" },
        });
        return c.json({
          success: true,
          data: { ...invitation, status: "CANCELLED" as const },
        });
      }

      return c.json({ success: true, data: invitation });
    },
  )

  // ************************
  // Accepter une invitation de projet (auth requise)
  // ************************
  .post(
    "/accept",
    requireAuth,
    loadOrganization,
    zValidator("json", z.object({ token: z.string() })),
    async (c) => {
      const organization = c.get("organization");
      const user = c.get("user");
      const { token } = c.req.valid("json");

      const invitation = await prisma.projectInvitation.findUnique({
        where: { token },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
              organizationId: true,
            },
          },
        },
      });

      if (!invitation || invitation.project.organizationId !== organization.id) {
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

      const existingProjectMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: invitation.project.id,
            userId: user.id,
          },
        },
      });

      if (existingProjectMember) {
        return c.json(
          {
            success: false,
            error: "Vous êtes déjà membre de ce projet",
            data: {
              organizationSlug: organization.slug,
              projectSlug: invitation.project.slug,
            },
          },
          409,
        );
      }

      await prisma.$transaction([
        prisma.projectMember.create({
          data: {
            projectId: invitation.project.id,
            userId: user.id,
            role: invitation.role,
          },
        }),
        prisma.projectInvitation.update({
          where: { id: invitation.id },
          data: { status: "ACCEPTED" },
        }),
      ]);

      return c.json({
        success: true,
        data: {
          organizationSlug: organization.slug,
          projectSlug: invitation.project.slug,
        },
      });
    },
  );

export default app;
