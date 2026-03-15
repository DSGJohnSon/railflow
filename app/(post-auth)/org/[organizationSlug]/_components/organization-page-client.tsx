"use client";

import { Button } from "@/components/ui/button";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { FolderAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { MembersList } from "@/features/organizations/components/members-list";
import { InvitationsList } from "@/features/organizations/components/invitations-list";

export default function OrganizationPageClient() {
  const { setIsOpen } = useCreateProjectModal();

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organisation</h1>
        <Button
          variant="default"
          size="default"
          onClick={() => setIsOpen(true)}
          className="cursor-pointer"
        >
          <HugeiconsIcon icon={FolderAddIcon} className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Membres</h2>
          <p className="text-sm text-muted-foreground">
            Les personnes qui font partie de cette organisation.
          </p>
        </div>
        <MembersList />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Invitations</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les invitations en attente et invitez de nouveaux membres.
          </p>
        </div>
        <InvitationsList />
      </section>
    </div>
  );
}
