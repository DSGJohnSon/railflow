"use client";

import { BentoCard } from "../ui/bento-card";
import { FolderAddIcon, FolderArchiveIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useGetMyProjects } from "@/features/projects/api/use-get-user-projects";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { Button } from "../ui/button";
import { useMemo } from "react";

interface Project {
  role: string;
  id: string;
  organizationSlug: string;
  slug: string;
  name: string;
}

export function ProjectsCard({ span = 12 }: { span?: number }) {
  const { data: projects, isPending } = useGetMyProjects();
  const { setIsOpen } = useCreateProjectModal();

  const { adminProjects, memberProjects } = useMemo(() => {
    const data = projects?.data || [];
    return {
      adminProjects: data.filter((p) => p.role === "ADMIN" || p.role === "OWNER"),
      memberProjects: data.filter((p) => p.role === "MEMBER"),
    };
  }, [projects]);

  if (!projects && !isPending) return null;

  const hasProjects = adminProjects.length > 0 || memberProjects.length > 0;

  return (
    <BentoCard span={span}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-olive-950 flex items-center gap-2">
          <HugeiconsIcon icon={FolderArchiveIcon} className="w-5 h-5" />
          Mes projets
        </h2>
        <Button
          variant="default"
          size="lg"
          onClick={() => setIsOpen(true)}
          className="cursor-pointer"
        >
          <HugeiconsIcon icon={FolderAddIcon} className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {isPending ? (
          <ProjectsListSkeleton />
        ) : !hasProjects ? (
          <div className="flex flex-col items-center justify-center py-8 text-olive-600 italic">
            Aucun projet trouvé.
          </div>
        ) : (
          <>
            {adminProjects.length > 0 && (
              <section>
                <h3 className="font-semibold text-olive-950 mb-2">Administrateur :</h3>
                <ProjectsList projects={adminProjects} />
              </section>
            )}
            {memberProjects.length > 0 && (
              <section>
                <h3 className="font-semibold text-olive-950 mb-2">Invité :</h3>
                <ProjectsList projects={memberProjects} />
              </section>
            )}
          </>
        )}
      </div>
    </BentoCard>
  );
}

function ProjectsListSkeleton() {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      }}
    >
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full h-15 rounded-xl border border-olive-200" />
      ))}
    </div>
  );
}

function ProjectsList({ projects }: { projects: Project[] }) {
  return (
    <div
      className="grid gap-4 items-start"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      }}
    >
      {projects.map((prj) => (
        <Link
          key={prj.id}
          href={`/org/${prj.organizationSlug}/projects/${prj.slug}`}
          className="w-full rounded-xl bg-olive-50 border border-olive-300 group/project-item hover:bg-olive-100 transition-colors cursor-pointer flex items-start justify-center gap-4 p-2"
        >
          <div className="bg-olive-200 p-2 rounded-lg size-10 flex items-center justify-center group-hover/project-item:bg-company-lime transition-colors shrink-0">
            <HugeiconsIcon icon={FolderArchiveIcon} className="w-3/4" />
          </div>
          <div className="flex-1 h-full">
            <p className="text-[0.6rem] font-light truncate">{prj.role}</p>
            <p className="text-sm font-medium wrap-break-word">{prj.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
