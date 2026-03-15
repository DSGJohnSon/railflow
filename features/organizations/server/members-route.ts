import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middlewares/api/require-auth";
import { loadOrganization } from "@/lib/middlewares/api/load-organization";
import { requireOrganizationMember } from "@/lib/middlewares/api/require-organization-member";
import { requireOrganizationAdmin } from "@/lib/middlewares/api/require-organization-admin";
import { updateMemberRoleSchema } from "../schemas";

// END OF IMPORTS ------------------------------------------------------------------

const app = new Hono()
  // ************************
  // Lister les membres
  // ************************
  .get(
    "/",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    async (c) => {
      const organization = c.get("organization");

      const members = await prisma.organizationMember.findMany({
        where: { organizationId: organization.id },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return c.json({ success: true, data: members });
    },
  )

  // ************************
  // Modifier le rôle d'un membre
  // ************************
  .patch(
    "/:memberId",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    requireOrganizationAdmin,
    zValidator("json", updateMemberRoleSchema),
    async (c) => {
      const organization = c.get("organization");
      const currentUser = c.get("user");
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");

      const member = await prisma.organizationMember.findUnique({
        where: { id: memberId, organizationId: organization.id },
      });

      if (!member) {
        return c.json({ success: false, error: "Membre introuvable" }, 404);
      }

      if (member.role === "OWNER") {
        return c.json(
          { success: false, error: "Impossible de modifier le rôle du propriétaire" },
          403,
        );
      }

      if (member.userId === currentUser.id) {
        return c.json(
          { success: false, error: "Vous ne pouvez pas modifier votre propre rôle" },
          403,
        );
      }

      const updated = await prisma.organizationMember.update({
        where: { id: memberId },
        data: { role },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      });

      return c.json({ success: true, data: updated });
    },
  )

  // ************************
  // Supprimer un membre
  // ************************
  .delete(
    "/:memberId",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    requireOrganizationAdmin,
    async (c) => {
      const organization = c.get("organization");
      const currentUser = c.get("user");
      const { memberId } = c.req.param();

      const member = await prisma.organizationMember.findUnique({
        where: { id: memberId, organizationId: organization.id },
      });

      if (!member) {
        return c.json({ success: false, error: "Membre introuvable" }, 404);
      }

      if (member.role === "OWNER") {
        return c.json(
          { success: false, error: "Impossible de supprimer le propriétaire" },
          403,
        );
      }

      if (member.userId === currentUser.id) {
        return c.json(
          { success: false, error: "Vous ne pouvez pas vous supprimer vous-même" },
          403,
        );
      }

      await prisma.organizationMember.delete({ where: { id: memberId } });

      return c.json({ success: true, data: null });
    },
  );

export default app;
