"use client";

//IMPORTS -----------------------------------------

//COMPONENTS
import { useGetOrganizationsByUserId } from "../api/use-get-organizations-by-user-id";

//ICONS
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { useCreateOrganizationModal } from "../hooks/use-create-organization-modal";
import Link from "next/link";

//CODE OF THE COMPONENT -----------------------------------------

function SelectOrganizations({ userId }: { userId: string }) {
  const { data: organizations, isPending } = useGetOrganizationsByUserId({
    userId,
  });

  const { setIsOpen } = useCreateOrganizationModal();

  return (
    <div>
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {/* OWNER and ADMIN */}
          <div className="space-y-2 p-4 border bg-zinc-50/50 rounded-md">
            <h2 className="font-semibold text-sm text-center">
              Organisations dont vous êtes propriétaire ou administrateur
            </h2>
            <div className="flex items-center justify-center gap-2">
              {organizations?.data
                .filter((el) => el.role === "OWNER" || el.role === "ADMIN")
                .map((el) => (
                  <Link
                    key={el.organization.id}
                    href={`/org/${el.organization.slug}`}
                    className="w-24 aspect-square rounded-md bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-xs text-center">
                      {el.organization.name}
                    </span>
                  </Link>
                ))}
              <div
                className="w-24 aspect-square rounded-md bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 cursor-pointer flex flex-col items-center justify-center gap-1"
                onClick={() => {
                  setIsOpen(true);
                }}
              >
                <HugeiconsIcon icon={Add01Icon} />
                <span className="text-xs text-center">
                  Créer une organization
                </span>
              </div>
            </div>
          </div>
          {/* MEMBER */}
          <div className="space-y-2 p-4 border bg-zinc-50/50 rounded-md">
            <h2 className="font-semibold text-sm text-center">
              Organisations dont vous êtes membre
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                {organizations?.data
                  .filter((el) => el.role === "MEMBER")
                  .map((el) => (
                    <Link
                      key={el.organization.id}
                      href={`/org/${el.organization.slug}`}
                      className="w-24 aspect-square rounded-md bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 cursor-pointer flex flex-col items-center justify-center gap-1"
                    >
                      <span className="text-xs text-center">
                        {el.organization.name}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SelectOrganizations;
