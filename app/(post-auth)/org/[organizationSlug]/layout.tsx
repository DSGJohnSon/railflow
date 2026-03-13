import "server-only";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface OrganizationLayoutProps {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}

export default async function OrganizationLayout({
  children,
  params,
}: OrganizationLayoutProps) {
  const { organizationSlug } = await params;

  const organization = await prisma.organization.findUnique({
    where: {
      slug: organizationSlug,
    },
  });

  if (!organization) {
    redirect("/404");
  }

  return <>{children}</>;
}
