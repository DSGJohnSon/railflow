"use client";

import { useGetProjectMembers } from "../api/use-get-project-members";
import { useUpdateProjectMemberRole } from "../api/use-update-project-member-role";
import { useRemoveProjectMember } from "../api/use-remove-project-member";
import { useGetOrganizationSlug } from "@/features/organizations/hooks/use-organization-slug";
import { useGetProjectSlug } from "../hooks/use-project-slug";
import { useCurrent } from "@/features/auth/api/use-current";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVerticalIcon, UserRemoveIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  COLLABORATOR: "Collaborateur",
  VISITOR: "Visiteur",
};

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  COLLABORATOR: "secondary",
  VISITOR: "outline",
};

type Member = {
  id: string;
  role: string;
  isOrgMember: boolean;
  isOrgOwner: boolean;
  user: { id: string; name: string; email: string; image?: string | null };
};

function MemberItem({
  member,
  canManageMembers,
  isCurrentUser,
  onUpdateRole,
  onRemove,
  isUpdatingRole,
  isRemoving,
}: {
  member: Member;
  canManageMembers: boolean;
  isCurrentUser: boolean;
  onUpdateRole: (memberId: string, role: "ADMIN" | "COLLABORATOR" | "VISITOR") => void;
  onRemove: (memberId: string) => void;
  isUpdatingRole: boolean;
  isRemoving: boolean;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border px-4 py-3">
      <Avatar>
        <AvatarImage src={member.user.image ?? undefined} alt={member.user.name} />
        <AvatarFallback>{member.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{member.user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
      </div>

      {member.isOrgOwner && (
        <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600 dark:text-amber-400 shrink-0">
          Directeur de l&apos;agence
        </Badge>
      )}
      <Badge variant={ROLE_VARIANTS[member.role] ?? "outline"}>
        {ROLE_LABELS[member.role] ?? member.role}
      </Badge>

      {canManageMembers && !isCurrentUser && !member.isOrgOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              disabled={isUpdatingRole || isRemoving}
            >
              <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {member.role !== "ADMIN" && (
              <DropdownMenuItem onClick={() => onUpdateRole(member.id, "ADMIN")}>
                Passer Administrateur
              </DropdownMenuItem>
            )}
            {member.role !== "COLLABORATOR" && (
              <DropdownMenuItem onClick={() => onUpdateRole(member.id, "COLLABORATOR")}>
                Passer Collaborateur
              </DropdownMenuItem>
            )}
            {member.role !== "VISITOR" && (
              <DropdownMenuItem onClick={() => onUpdateRole(member.id, "VISITOR")}>
                Passer Visiteur
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onRemove(member.id)}
            >
              <HugeiconsIcon icon={UserRemoveIcon} className="size-4 mr-2" />
              Retirer du projet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}

export function ProjectMembersList() {
  const organizationSlug = useGetOrganizationSlug();
  const projectSlug = useGetProjectSlug();
  const { data: members, isLoading } = useGetProjectMembers(organizationSlug, projectSlug);
  const { data: currentUser } = useCurrent();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateProjectMemberRole();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveProjectMember();

  const currentMember = members?.find((m) => m.user.id === currentUser?.id);
  const canManageMembers = currentMember?.role === "ADMIN";

  function handleUpdateRole(memberId: string, role: "ADMIN" | "COLLABORATOR" | "VISITOR") {
    updateRole({ organizationSlug, projectSlug, memberId, json: { role } });
  }

  function handleRemove(memberId: string) {
    removeMember({ organizationSlug, projectSlug, memberId });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!members?.length) {
    return (
      <p className="text-sm text-muted-foreground">Aucun membre dans ce projet.</p>
    );
  }

  const orgMembers = members.filter((m) => m.isOrgMember);
  const externalMembers = members.filter((m) => !m.isOrgMember);

  return (
    <div className="space-y-6">
      {orgMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Membres de l&apos;organisation
          </p>
          <ul className="space-y-2">
            {orgMembers.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                canManageMembers={canManageMembers}
                isCurrentUser={member.user.id === currentUser?.id}
                onUpdateRole={handleUpdateRole}
                onRemove={handleRemove}
                isUpdatingRole={isUpdatingRole}
                isRemoving={isRemoving}
              />
            ))}
          </ul>
        </div>
      )}

      {externalMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Membres externes
          </p>
          <ul className="space-y-2">
            {externalMembers.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                canManageMembers={canManageMembers}
                isCurrentUser={member.user.id === currentUser?.id}
                onUpdateRole={handleUpdateRole}
                onRemove={handleRemove}
                isUpdatingRole={isUpdatingRole}
                isRemoving={isRemoving}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
