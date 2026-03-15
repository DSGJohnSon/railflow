import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middlewares/api/require-auth";
import { loadOrganization } from "@/lib/middlewares/api/load-organization";
import { requireOrganizationMember } from "@/lib/middlewares/api/require-organization-member";
import { loadProject } from "@/lib/middlewares/api/load-project";
import { requireProjectMember } from "@/lib/middlewares/api/require-project-member";
import { requireProjectAdmin } from "@/lib/middlewares/api/require-project-admin";
import { requireProjectAccess } from "@/lib/middlewares/api/require-project-access";
import { updateProjectMemberRoleSchema, addOrgMembersToProjectSchema } from "../schemas";
import { sendProjectAddedNotificationEmail } from "@/lib/email";

// END OF IMPORTS ------------------------------------------------------------------

const app = new Hono()
  // ************************
  // Lister les membres d'un projet
  // Accessible aux membres de l'org ET aux membres externes du projet (Option B)
  // ************************
  .get(
    "/",
    requireAuth,
    loadOrganization,
    loadProject,
    requireProjectAccess,
    async (c) => {
      const project = c.get("project");
      const organization = c.get("organization");

      const [members, orgMemberIds] = await Promise.all([
        prisma.projectMember.findMany({
          where: { projectId: project.id },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.organizationMember.findMany({
          where: { organizationId: organization.id },
          select: { userId: true },
        }),
      ]);

      const orgMemberSet = new Set(orgMemberIds.map((m) => m.userId));

      const enriched = members.map((m) => ({
        ...m,
        isOrgMember: orgMemberSet.has(m.user.id),
        isOrgOwner: m.user.id === organization.ownerId,
      }));

      return c.json({ success: true, data: enriched });
    },
  )

  // ************************
  // Lister les membres de l'org disponibles pour ajout au projet
  // ************************
  .get(
    "/available",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    loadProject,
    requireProjectMember,
    requireProjectAdmin,
    async (c) => {
      const project = c.get("project");
      const organization = c.get("organization");

      const existingProjectMemberIds = (
        await prisma.projectMember.findMany({
          where: { projectId: project.id },
          select: { userId: true },
        })
      ).map((m) => m.userId);

      const available = await prisma.organizationMember.findMany({
        where: {
          organizationId: organization.id,
          userId: { notIn: existingProjectMemberIds },
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return c.json({ success: true, data: available });
    },
  )

  // ************************
  // Ajouter plusieurs membres de l'org directement au projet
  // ************************
  .post(
    "/bulk",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    loadProject,
    requireProjectMember,
    requireProjectAdmin,
    zValidator("json", addOrgMembersToProjectSchema),
    async (c) => {
      const project = c.get("project");
      const organization = c.get("organization");
      const user = c.get("user");
      const { members } = c.req.valid("json");

      // Vérifie que tous les userId sont bien membres de l'org
      const orgMemberIds = new Set(
        (
          await prisma.organizationMember.findMany({
            where: { organizationId: organization.id },
            select: { userId: true },
          })
        ).map((m) => m.userId),
      );

      const invalidIds = members.filter((m) => !orgMemberIds.has(m.userId));
      if (invalidIds.length > 0) {
        return c.json(
          { success: false, error: "Certains utilisateurs ne sont pas membres de l'organisation" },
          400,
        );
      }

      // Filtre les userId déjà membres du projet
      const existingProjectMemberIds = new Set(
        (
          await prisma.projectMember.findMany({
            where: { projectId: project.id },
            select: { userId: true },
          })
        ).map((m) => m.userId),
      );

      const toAdd = members.filter((m) => !existingProjectMemberIds.has(m.userId));

      if (toAdd.length === 0) {
        return c.json({ success: true, data: [] });
      }

      const created = await prisma.$transaction(
        toAdd.map((m) =>
          prisma.projectMember.create({
            data: {
              projectId: project.id,
              userId: m.userId,
              role: m.role,
            },
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          }),
        ),
      );

      // Envoi des notifications email en arrière-plan
      const adder = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true },
      });

      const orgData = await prisma.organization.findUnique({
        where: { id: organization.id },
        select: { name: true, slug: true },
      });

      if (adder && orgData) {
        const toNotify = toAdd.filter((m) => m.notifyByEmail);
        await Promise.allSettled(
          toNotify.map(async (m) => {
            const member = created.find((c) => c.userId === m.userId);
            if (!member) return;
            await sendProjectAddedNotificationEmail({
              to: member.user.email,
              addedByName: adder.name,
              organizationName: orgData.name,
              organizationSlug: orgData.slug,
              projectName: project.name,
              projectSlug: project.slug,
            });
          }),
        );
      }

      return c.json({ success: true, data: created }, 201);
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
    loadProject,
    requireProjectMember,
    requireProjectAdmin,
    zValidator("json", updateProjectMemberRoleSchema),
    async (c) => {
      const project = c.get("project");
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");

      const organization = c.get("organization");

      const member = await prisma.projectMember.findUnique({
        where: { id: memberId, projectId: project.id },
      });

      if (!member) {
        return c.json({ success: false, error: "Membre introuvable" }, 404);
      }

      if (member.userId === organization.ownerId) {
        return c.json(
          { success: false, error: "Le rôle du directeur de l'agence ne peut pas être modifié" },
          403,
        );
      }

      const updated = await prisma.projectMember.update({
        where: { id: memberId },
        data: { role },
      });

      return c.json({ success: true, data: updated });
    },
  )

  // ************************
  // Retirer un membre du projet
  // ************************
  .delete(
    "/:memberId",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    loadProject,
    requireProjectMember,
    requireProjectAdmin,
    async (c) => {
      const project = c.get("project");
      const { memberId } = c.req.param();

      const organization = c.get("organization");

      const member = await prisma.projectMember.findUnique({
        where: { id: memberId, projectId: project.id },
      });

      if (!member) {
        return c.json({ success: false, error: "Membre introuvable" }, 404);
      }

      if (member.userId === organization.ownerId) {
        return c.json(
          { success: false, error: "Le directeur de l'agence ne peut pas être retiré d'un projet" },
          403,
        );
      }

      await prisma.projectMember.delete({ where: { id: memberId } });

      return c.json({ success: true, data: { id: memberId } });
    },
  );

export default app;
