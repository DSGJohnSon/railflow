"use client"

import { Button } from "@/components/ui/button";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { FolderAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function Page() {

  const { setIsOpen } = useCreateProjectModal();

  return (
    <div className="flex justify-center items-center flex-col gap-4">
      Page Organization
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
  );
}

export default Page;
