"use client";

import { useState } from "react";
import { useAddOrgMembersModal } from "../../hooks/use-add-org-members-modal";
import { useGetAvailableOrgMembers } from "../../api/use-get-available-org-members";
import { useAddOrgMembersToProject } from "../../api/use-add-org-members-to-project";
import { useGetOrganizationSlug } from "@/features/organizations/hooks/use-organization-slug";
import { useGetProjectSlug } from "../../hooks/use-project-slug";
import { OrgMemberSelector, type OrgMemberSelection } from "../org-member-selector";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AddOrgMembersModal() {
  const { isOpen, close } = useAddOrgMembersModal();
  const organizationSlug = useGetOrganizationSlug();
  const projectSlug = useGetProjectSlug();

  const { data: availableMembers = [], isLoading } = useGetAvailableOrgMembers(
    organizationSlug,
    projectSlug,
  );

  const { mutate: addMembers, isPending } = useAddOrgMembersToProject();
  const [selected, setSelected] = useState<OrgMemberSelection[]>([]);

  function handleSubmit() {
    if (selected.length === 0) return;
    addMembers(
      {
        organizationSlug,
        projectSlug,
        json: {
          members: selected.map((m) => ({
            userId: m.userId,
            role: m.role,
            notifyByEmail: m.notifyByEmail,
          })),
        },
      },
      {
        onSuccess: () => {
          setSelected([]);
          close();
        },
      },
    );
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelected([]);
      close();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter depuis l&apos;organisation</DialogTitle>
          <DialogDescription>
            Ajoutez directement des membres de l&apos;organisation à ce projet.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Chargement des membres...
          </div>
        ) : (
          <OrgMemberSelector
            availableMembers={availableMembers}
            value={selected}
            onChange={setSelected}
          />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selected.length === 0 || isPending}
          >
            Ajouter {selected.length > 0 ? `(${selected.length})` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
