"use client";

// IMPORTS -----------------------------------------

// HOOKS API
import { useGetMyOrganizations } from "../api/use-get-user-organizations";

//HOOKS
import { useCreateOrganizationModal } from "../hooks/use-create-organization-modal";

// UTILITIES
import Link from "next/link";

// ICONS
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

// CODE OF THE COMPONENT -----------------------------------------

function MyOrganizationList() {
  const { data: organizations, isPending } = useGetMyOrganizations();

  const { setIsOpen } = useCreateOrganizationModal();

  return (
    <div>
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {/* OWNER and ADMIN */}
          <div className="space-y-2 p-4 border bg-olive-50/50 rounded-md">
            <h2 className="font-semibold text-sm text-center">
              Organisations dont vous êtes propriétaire ou administrateur
            </h2>
            <div className="flex items-center justify-center gap-2">
              {organizations?.data
                .filter((org) => org.role === "OWNER" || org.role === "ADMIN")
                .map((org) => (
                  <Link
                    key={org.id}
                    href={`/org/${org.slug}`}
                    className="w-24 aspect-square rounded-md bg-olive-100 border border-olive-300 hover:bg-olive-200 cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-xs text-center">{org.name}</span>
                  </Link>
                ))}
              <div
                className="w-24 aspect-square rounded-md bg-olive-100 border border-olive-300 hover:bg-olive-200 cursor-pointer flex flex-col items-center justify-center gap-1"
                onClick={() => {
                  setIsOpen(true);
                }}
              >
                <HugeiconsIcon icon={Add01Icon} />
                <span className="text-xs text-center">
                  Créer une organisation
                </span>
              </div>
            </div>
          </div>
          {/* MEMBER */}
          <div className="space-y-2 p-4 border bg-olive-50/50 rounded-md">
            <h2 className="font-semibold text-sm text-center">
              Organisations dont vous êtes membre
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                {organizations?.data
                  .filter((org) => org.role === "MEMBER")
                  .map((org) => (
                    <Link
                      key={org.id}
                      href={`/org/${org.slug}`}
                      className="w-24 aspect-square rounded-md bg-olive-100 border border-olive-300 hover:bg-olive-200 cursor-pointer flex flex-col items-center justify-center gap-1"
                    >
                      <span className="text-xs text-center">{org.name}</span>
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

export default MyOrganizationList;
