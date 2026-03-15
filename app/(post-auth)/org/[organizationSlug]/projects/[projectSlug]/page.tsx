import { getCurrent } from "@/features/auth/actions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProjectPageClient from "./_components/project-page-client";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ organizationSlug: string; projectSlug: string }>;
}

async function Page({ params }: PageProps) {
  const { organizationSlug, projectSlug } = await params;

  const user = await getCurrent();
  if (!user) redirect("/login");

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });

  if (!organization) redirect("/404");

  const project = await prisma.project.findFirst({
    where: { slug: projectSlug, organizationId: organization.id },
  });

  if (!project) redirect("/404");

  const orgMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId: organization.id, userId: user.id },
    },
  });

  // Vérifie l'accès direct au projet (org members + external members)
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId: project.id, userId: user.id },
    },
  });

  if (!projectMember) {
    // Différencie le message selon si l'utilisateur est dans l'org ou non
    const backHref = orgMember
      ? `/org/${organizationSlug}`
      : `/dashboard`;
    const backLabel = orgMember
      ? "Retour à l'organisation"
      : "Retour au tableau de bord";

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {organization.name} — {project.name}
          </p>
          <h1 className="text-2xl font-bold">Accès refusé</h1>
          <p className="text-muted-foreground max-w-sm">
            Vous n&apos;êtes pas membre de ce projet.
          </p>
        </div>
        <Button asChild>
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    );
  }

  return <ProjectPageClient />;
}

export default Page;
