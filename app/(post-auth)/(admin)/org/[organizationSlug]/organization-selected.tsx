"use client";

//HOOKS
import { useGetOrganizationsByUserId } from "@/features/organizations/api/use-get-organizations-by-user-id";
import { useGetOrganizationSlug } from "@/features/organizations/hooks/use-organization-slug";

//ICONS
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

function OrganizationSelected({ userId }: { userId: string }) {
  const organizationSlug = useGetOrganizationSlug();

  const { data: organization, isLoading } = useGetOrganizationsByUserId({
    userId,
  });

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center flex-col gap-4">
        <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-zinc-100 border border-zinc-200 p-4 rounded-md">
        OrganizationSelected :{" "}
        {
          organization?.data.find(
            (org) => org.organization.slug === organizationSlug,
          )?.organization.name
        }
      </div>
      <div>
        Others organizations :
        {organization?.data
          .filter((org) => org.organization.slug !== organizationSlug)
          .map((org) => (
            <div key={org.organization.id}>{org.organization.name}</div>
          ))}
      </div>
    </div>
  );
}

export default OrganizationSelected;
