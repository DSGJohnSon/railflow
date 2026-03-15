import { getCurrent } from "@/features/auth/actions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OrganizationPageClient from "./_components/organization-page-client";

interface PageProps {
  params: Promise<{ organizationSlug: string }>;
}

async function Page({ params }: PageProps) {
  const { organizationSlug } = await params;

  const user = await getCurrent();
  if (!user) redirect("/login");

  const membership = await prisma.organizationMember.findFirst({
    where: {
      organization: { slug: organizationSlug },
      userId: user.id,
    },
  });

  if (!membership) redirect("/dashboard?flash=not-member");

  return <OrganizationPageClient />;
}

export default Page;
