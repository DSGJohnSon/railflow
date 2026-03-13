//HONO & ZOD
import { Hono } from "hono";

//PRISMA
import { prisma } from "@/lib/prisma";

//MIDDLEWARES
import { requireAuth } from "@/lib/middlewares/api/require-auth";

// END OF IMPORTS ------------------------------------------------------------------

const app = new Hono()
  //******************** */
  //Retourner les organisations dont le user courant est membre
  //******************** */
  .get("/", requireAuth, async (c) => {
    const user = c.get("user");

    const organizations = await prisma.organizationMember.findMany({
      where: {
        userId: user.id,
      },
      select: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const serializedOrganizations = organizations.map((organization: { role: string; organization: { id: string; name: string; slug: string } }) => ({
      role: organization.role,
      ...organization.organization,
    }));

    return c.json({ success: true, data: serializedOrganizations }, 200);
  });

export default app;
