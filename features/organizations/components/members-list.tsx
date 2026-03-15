"use client";

import { useGetOrganizationMembers } from "../api/use-get-organization-members";
import { useUpdateMemberRole } from "../api/use-update-member-role";
import { useRemoveMember } from "../api/use-remove-member";
import { useGetOrganizationSlug } from "../hooks/use-organization-slug";
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
  OWNER: "Propriétaire",
  ADMIN: "Administrateur",
  MEMBER: "Membre",
};

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  OWNER: "default",
  ADMIN: "secondary",
  MEMBER: "outline",
};

export function MembersList() {
  const organizationSlug = useGetOrganizationSlug();
  const { data: members, isLoading } = useGetOrganizationMembers(organizationSlug);
  const { data: currentUser } = useCurrent();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateMemberRole();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();

  const currentMember = members?.find((m) => m.user.id === currentUser?.id);
  const canManageMembers =
    currentMember?.role === "ADMIN" || currentMember?.role === "OWNER";

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
      <p className="text-sm text-muted-foreground">
        Aucun membre dans cette organisation.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center gap-3 rounded-lg border px-4 py-3"
        >
          <Avatar>
            <AvatarImage src={member.user.image ?? undefined} alt={member.user.name} />
            <AvatarFallback>
              {member.user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{member.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
          </div>

          <Badge variant={ROLE_VARIANTS[member.role] ?? "outline"}>
            {ROLE_LABELS[member.role] ?? member.role}
          </Badge>

          {canManageMembers && member.role !== "OWNER" && member.user.id !== currentUser?.id && (
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
                  <DropdownMenuItem
                    onClick={() =>
                      updateRole({
                        organizationSlug,
                        memberId: member.id,
                        json: { role: "ADMIN" },
                      })
                    }
                  >
                    Passer Administrateur
                  </DropdownMenuItem>
                )}
                {member.role !== "MEMBER" && (
                  <DropdownMenuItem
                    onClick={() =>
                      updateRole({
                        organizationSlug,
                        memberId: member.id,
                        json: { role: "MEMBER" },
                      })
                    }
                  >
                    Passer Membre
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() =>
                    removeMember({ organizationSlug, memberId: member.id })
                  }
                >
                  <HugeiconsIcon icon={UserRemoveIcon} className="size-4 mr-2" />
                  Retirer de l&apos;organisation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </li>
      ))}
    </ul>
  );
}
