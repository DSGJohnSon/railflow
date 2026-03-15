import { getCurrent } from "@/features/auth/actions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OrganizationPageClient from "./_components/organization-page-client";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ organizationSlug: string }>;
}

async function Page({ params }: PageProps) {
  const { organizationSlug } = await params;

  const user = await getCurrent();
  if (!user) redirect("/login");

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });

  if (!organization) redirect("/404");

  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId: organization.id,
      userId: user.id,
    },
  });

  if (!membership) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {organization.name}
          </p>
          <h1 className="text-2xl font-bold">Accès refusé</h1>
          <p className="text-muted-foreground max-w-sm">
            Vous n&apos;êtes pas membre de cette organisation.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">Retour au tableau de bord</Link>
        </Button>
      </div>
    );
  }

  return <OrganizationPageClient />;
}

export default Page;
