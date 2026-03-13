"use client";

// IMPORTS -----------------------------------------

// HOOKS API
import { useGetMyProjects } from "../api/use-get-user-projects";

// UTILITIES
import Link from "next/link";

// CODE OF THE COMPONENT -----------------------------------------

function MyProjectsList() {
  const { data: projects, isPending } = useGetMyProjects();

  return (
    <div>
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {/* OWNER and ADMIN */}
          <div className="space-y-2 p-4 border bg-olive-50/50 rounded-md">
            <h2 className="font-semibold text-sm text-center">
              Projets dont vous êtes propriétaire ou administrateur
            </h2>
            <div className="flex items-center justify-center gap-2">
              {projects?.data
                .filter((prj) => prj.role === "OWNER" || prj.role === "ADMIN")
                .map((prj) => (
                  <Link
                    key={prj.id}
                    href={`/org/${prj.organizationSlug}/projects/${prj.slug}`}
                    className="w-24 aspect-square rounded-md bg-olive-100 border border-olive-300 hover:bg-olive-200 cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-xs text-center">{prj.name}</span>
                  </Link>
                ))}
            </div>
          </div>
          {/* MEMBER */}
          <div className="space-y-2 p-4 border bg-olive-50/50 rounded-md">
            <h2 className="font-semibold text-sm text-center">
              Projets dont vous êtes membre
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                {projects?.data
                  .filter((prj) => prj.role === "MEMBER")
                  .map((prj) => (
                    <Link
                      key={prj.id}
                      href={`/org/${prj.organizationSlug}/projects/${prj.slug}`}
                      className="w-24 aspect-square rounded-md bg-olive-100 border border-olive-300 hover:bg-olive-200 cursor-pointer flex flex-col items-center justify-center gap-1"
                    >
                      <span className="text-xs text-center">{prj.name}</span>
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

export default MyProjectsList;
