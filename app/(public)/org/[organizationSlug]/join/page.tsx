import { prisma } from "@/lib/prisma";
import { getCurrent } from "@/features/auth/actions";
import Image from "next/image";
import Link from "next/link";
import OrgJoinActions from "./join-actions";

interface PageProps {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

async function Page({ params, searchParams }: PageProps) {
  const { organizationSlug } = await params;
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

  const [rawInvitation, user] = await Promise.all([
    prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: { select: { name: true, slug: true } },
        invitedBy: { select: { name: true, image: true } },
      },
    }),
    getCurrent(),
  ]);

  let invitation = rawInvitation;

  if (invitation && invitation.organizationId !== organization.id) {
    invitation = null;
  }

  if (invitation && invitation.status === "PENDING" && invitation.expiresAt < new Date()) {
    await prisma.organizationInvitation.update({
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
          <OrgJoinActions
            invitation={invitation}
            token={token}
            organizationSlug={organizationSlug}
            isAuthenticated={!!user}
          />
        </div>
      </main>
    </div>
  );
}

export default Page;
