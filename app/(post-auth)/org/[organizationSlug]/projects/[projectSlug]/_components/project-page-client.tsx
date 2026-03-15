"use client";

import { useInviteProjectMemberModal } from "@/features/projects/hooks/use-invite-project-member-modal";
import { useAddOrgMembersModal } from "@/features/projects/hooks/use-add-org-members-modal";
import { ProjectMembersList } from "@/features/projects/components/members-list";
import { ProjectInvitationsList } from "@/features/projects/components/invitations-list";
import { Button } from "@/components/ui/button";
import { UserAdd01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function ProjectPageClient() {
  const { open: openInvite } = useInviteProjectMemberModal();
  const { open: openAddOrgMembers } = useAddOrgMembersModal();

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projet</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={openAddOrgMembers}
            className="cursor-pointer"
          >
            <HugeiconsIcon icon={UserAdd01Icon} className="w-4 h-4 mr-2" />
            Ajouter depuis l&apos;organisation
          </Button>
          <Button
            variant="default"
            size="default"
            onClick={openInvite}
            className="cursor-pointer"
          >
            <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 mr-2" />
            Inviter par email
          </Button>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Membres</h2>
          <p className="text-sm text-muted-foreground">
            Les personnes qui participent à ce projet.
          </p>
        </div>
        <ProjectMembersList />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Invitations</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les invitations en attente et invitez de nouveaux collaborateurs.
          </p>
        </div>
        <ProjectInvitationsList />
      </section>
    </div>
  );
}
