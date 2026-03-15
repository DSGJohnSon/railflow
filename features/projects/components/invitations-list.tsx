"use client";

import { useGetProjectInvitations } from "../api/use-get-project-invitations";
import { useCancelProjectInvitation } from "../api/use-cancel-project-invitation";
import { useInviteProjectMemberModal } from "../hooks/use-invite-project-member-modal";
import { useGetOrganizationSlug } from "@/features/organizations/hooks/use-organization-slug";
import { useGetProjectSlug } from "../hooks/use-project-slug";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAdd01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const ROLE_LABELS: Record<string, string> = {
  COLLABORATOR: "Collaborateur",
  VISITOR: "Visiteur",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  CANCELLED: "Annulée",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  ACCEPTED: "default",
  CANCELLED: "destructive",
};

function formatExpiry(expiresAt: string) {
  const date = new Date(expiresAt);
  const now = new Date();
  if (date < now) return "Expirée";
  return `Expire le ${date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function ProjectInvitationsList() {
  const organizationSlug = useGetOrganizationSlug();
  const projectSlug = useGetProjectSlug();
  const { data: invitations, isLoading } = useGetProjectInvitations(organizationSlug, projectSlug);
  const { mutate: cancelInvitation, isPending: isCancelling } = useCancelProjectInvitation();
  const { open } = useInviteProjectMemberModal();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const activeInvitations = invitations?.filter((inv) => inv.status === "PENDING") ?? [];
  const pastInvitations = invitations?.filter((inv) => inv.status !== "PENDING") ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {activeInvitations.length} invitation{activeInvitations.length !== 1 ? "s" : ""} en attente
        </span>
        <Button size="sm" onClick={open} className="gap-2">
          <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
          Inviter un membre
        </Button>
      </div>

      {activeInvitations.length === 0 && pastInvitations.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucune invitation envoyée.</p>
      )}

      {activeInvitations.length > 0 && (
        <ul className="space-y-2">
          {activeInvitations.map((invitation) => (
            <li
              key={invitation.id}
              className="flex items-center gap-3 rounded-lg border px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{invitation.email}</p>
                <p className="text-xs text-muted-foreground">
                  {formatExpiry(invitation.expiresAt as unknown as string)} · Rôle :{" "}
                  {ROLE_LABELS[invitation.role] ?? invitation.role}
                </p>
              </div>

              <Badge variant={STATUS_VARIANTS[invitation.status] ?? "outline"}>
                {STATUS_LABELS[invitation.status] ?? invitation.status}
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={isCancelling}
                onClick={() =>
                  cancelInvitation({
                    organizationSlug,
                    projectSlug,
                    invitationId: invitation.id,
                  })
                }
                title="Annuler l'invitation"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                <span className="sr-only">Annuler</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {pastInvitations.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground uppercase tracking-wide pt-2">Historique</p>
          <ul className="space-y-2">
            {pastInvitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 opacity-60"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Rôle : {ROLE_LABELS[invitation.role] ?? invitation.role}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANTS[invitation.status] ?? "outline"}>
                  {STATUS_LABELS[invitation.status] ?? invitation.status}
                </Badge>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
