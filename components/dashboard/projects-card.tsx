"use client";

import { BentoCard } from "../ui/bento-card";
import {
  FolderAddIcon,
  FolderArchiveIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useGetMyProjects } from "@/features/projects/api/use-get-user-projects";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { Button } from "../ui/button";

interface Project {
  role: string;
  id: string;
  organizationSlug: string;
  slug: string;
  name: string;
}

export function ProjectsCard({ span = 12 }: { span?: number }) {
  const { data: projects, isPending } = useGetMyProjects();

  const adminProjects = projects?.data.filter(
    (p) => p.role === "ADMIN" || p.role === "OWNER",
  );
  const memberProjects = projects?.data.filter((p) => p.role === "MEMBER");

  const { setIsOpen } = useCreateProjectModal();

  if (!projects && !isPending) return null;

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
      {adminProjects && adminProjects.length > 0 && (
        <>
          <h3 className="font-semibold text-olive-950 mt-4 mb-2">
            Administrateur :
          </h3>
          <ProjectsList projects={adminProjects} isPending={isPending} />
        </>
      )}
      {memberProjects && memberProjects.length > 0 && (
        <>
          <h3 className="font-semibold text-olive-950 mt-4 mb-2">Invité :</h3>
          <ProjectsList projects={memberProjects} isPending={isPending} />
        </>
      )}
    </BentoCard>
  );
}

function ProjectsList({
  projects,
  isPending,
}: {
  projects: Project[] | undefined;
  isPending: boolean;
}) {
  return (
    <div>
      {isPending ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          }}
        >
          <Skeleton className="w-full h-15 rounded-xl border border-olive-200" />
          <Skeleton className="w-full h-15 rounded-xl border border-olive-200" />
          <Skeleton className="w-full h-15 rounded-xl border border-olive-200" />
        </div>
      ) : (
        <div
          className="grid gap-4 items-start"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          }}
        >
          {projects?.map(
            (prj: {
              id: string;
              organizationSlug: string;
              slug: string;
              name: string;
              role: string;
            }) => (
              <Link
                key={prj.id}
                href={`/org/${prj.organizationSlug}/projects/${prj.slug}`}
                className="w-full rounded-xl bg-olive-50 border border-olive-300 group/project-item hover:bg-olive-100 transition-colors cursor-pointer flex items-start justify-center gap-4 p-2"
              >
                <div className="bg-olive-200 p-2 rounded-lg size-10 flex items-center justify-center group-hover/project-item:bg-company-lime transition-colors shrink-0">
                  <HugeiconsIcon icon={FolderArchiveIcon} className="w-3/4" />
                </div>
                <div className="flex-1 h-full">
                  <p className="text-[0.6rem] font-light  truncate">
                    {prj.role}
                  </p>
                  <p className="text-sm font-medium wrap-break-word">
                    {prj.name}
                  </p>
                </div>
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
