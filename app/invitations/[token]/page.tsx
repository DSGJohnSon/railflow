import { prisma } from "@/lib/prisma";
import { getCurrent } from "@/features/auth/actions";
import Image from "next/image";
import Link from "next/link";
import InvitationActions from "./invitation-actions";

interface PageProps {
  params: Promise<{ token: string }>;
}

async function Page({ params }: PageProps) {
  const { token } = await params;

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
          <InvitationActions
            invitation={invitation}
            token={token}
            isAuthenticated={!!user}
          />
        </div>
      </main>
    </div>
  );
}

export default Page;
