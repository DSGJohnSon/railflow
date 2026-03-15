//HONO & ZOD
import { Hono } from "hono";

//PRISMA
import { prisma } from "@/lib/prisma";

//MIDDLEWARES
import { requireAuth } from "@/lib/middlewares/api/require-auth";

// END OF IMPORTS ------------------------------------------------------------------

const app = new Hono()
  //******************** */
  //Retourner les projets dont le user courant est membre
  //******************** */
  .get("/", requireAuth, async (c) => {
    const user = c.get("user");

    const projects = await prisma.projectMember.findMany({
      where: {
        userId: user.id,
      },
      select: {
        role: true,
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            organization: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });

    const serializedProjects = projects.map(
      (project: {
        role: string;
        project: {
          id: string;
          name: string;
          slug: string;
          organization: { slug: string };
        };
      }) => ({
        role: project.role,
        id: project.project.id,
        name: project.project.name,
        slug: project.project.slug,
        organizationSlug: project.project.organization.slug,
      }),
    );

    return c.json({ success: true, data: serializedProjects }, 200);
  });

export default app;
