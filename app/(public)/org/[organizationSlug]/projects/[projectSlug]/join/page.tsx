import { prisma } from "@/lib/prisma";
import { getCurrent } from "@/features/auth/actions";
import Image from "next/image";
import Link from "next/link";
import ProjectJoinActions from "./join-actions";

interface PageProps {
  params: Promise<{ organizationSlug: string; projectSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

async function Page({ params, searchParams }: PageProps) {
  const { organizationSlug, projectSlug } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Lien d&apos;invitation invalide.</p>
      </div>
    );
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Organisation introuvable.</p>
      </div>
    );
  }

  const project = await prisma.project.findFirst({
    where: { slug: projectSlug, organizationId: organization.id },
  });

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Projet introuvable.</p>
      </div>
    );
  }

  const [rawInvitation, user] = await Promise.all([
    prisma.projectInvitation.findUnique({
      where: { token },
      include: {
        project: { select: { name: true, slug: true } },
        invitedBy: { select: { name: true, image: true } },
      },
    }),
    getCurrent(),
  ]);

  let invitation = rawInvitation;

  if (invitation && invitation.projectId !== project.id) {
    invitation = null;
  }

  if (invitation && invitation.status === "PENDING" && invitation.expiresAt < new Date()) {
    await prisma.projectInvitation.update({
      where: { id: invitation.id },
      data: { status: "CANCELLED" },
    });
    invitation = { ...invitation, status: "CANCELLED" };
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4">
        <Link href="/">
          <Image
            src="/logo/logo_line.svg"
            alt="Logo Railflow™"
            width={120}
            height={40}
            className="object-contain"
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <ProjectJoinActions
            invitation={invitation}
            token={token}
            organizationSlug={organizationSlug}
            projectSlug={projectSlug}
            organizationName={organization.name}
            isAuthenticated={!!user}
          />
        </div>
      </main>
    </div>
  );
}

export default Page;
