"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Cancel01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type OrgMemberSelection = {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: "COLLABORATOR" | "VISITOR";
  notifyByEmail: boolean;
};

export type LockedMember = {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  label: string;
};

type AvailableMember = {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

type OrgMemberSelectorProps = {
  availableMembers: AvailableMember[];
  value: OrgMemberSelection[];
  onChange: (value: OrgMemberSelection[]) => void;
  lockedMembers?: LockedMember[];
};

const ROLE_LABELS: Record<string, string> = {
  COLLABORATOR: "Collaborateur",
  VISITOR: "Visiteur",
};

export function OrgMemberSelector({
  availableMembers,
  value,
  onChange,
  lockedMembers = [],
}: OrgMemberSelectorProps) {
  const [search, setSearch] = useState("");

  const selectedIds = new Set(value.map((m) => m.userId));
  const lockedIds = new Set(lockedMembers.map((m) => m.userId));

  const filtered = availableMembers.filter(
    (m) =>
      !selectedIds.has(m.user.id) &&
      !lockedIds.has(m.user.id) &&
      (m.user.name.toLowerCase().includes(search.toLowerCase()) ||
        m.user.email.toLowerCase().includes(search.toLowerCase())),
  );

  function handleSelect(member: AvailableMember) {
    onChange([
      ...value,
      {
        userId: member.user.id,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
        role: "COLLABORATOR",
        notifyByEmail: false,
      },
    ]);
    setSearch("");
  }

  function handleRemove(userId: string) {
    onChange(value.filter((m) => m.userId !== userId));
  }

  function handleRoleChange(userId: string, role: "COLLABORATOR" | "VISITOR") {
    onChange(value.map((m) => (m.userId === userId ? { ...m, role } : m)));
  }

  function handleNotifyChange(userId: string, notifyByEmail: boolean) {
    onChange(value.map((m) => (m.userId === userId ? { ...m, notifyByEmail } : m)));
  }

  const totalCount = lockedMembers.length + value.length;

  return (
    <div className="space-y-3">
      {/* Search / List */}
      <div className="border rounded-lg overflow-hidden">
        <div className="px-3 pt-3 pb-2 border-b">
          <input
            type="text"
            placeholder="Rechercher un membre..."
            className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="h-40 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground px-3 py-4 text-center">
              {availableMembers.filter((m) => !lockedIds.has(m.user.id)).length === 0
                ? "Tous les membres sont déjà dans ce projet"
                : "Aucun résultat"}
            </p>
          ) : (
            <ul>
              {filtered.map((member) => (
                <li key={member.user.id}>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                    onClick={() => handleSelect(member)}
                  >
                    <Avatar className="size-7">
                      <AvatarImage src={member.user.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {member.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                    </div>
                    <HugeiconsIcon icon={UserAdd01Icon} className="size-4 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recap */}
      {totalCount > 0 && (
        <div className="space-y-2">
          {/* Locked members (non-removable) */}
          {lockedMembers.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/30 px-3 py-2.5"
            >
              <Avatar className="size-8">
                <AvatarImage src={member.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.label}</p>
              </div>
              <Badge variant="default" className="text-xs shrink-0">Admin</Badge>
            </div>
          ))}

          {/* Selectable members (removable) */}
          {value.map((member) => (
            <div
              key={member.userId}
              className="flex items-start gap-3 rounded-lg border px-3 py-2.5"
            >
              <Avatar className="size-8 mt-0.5">
                <AvatarImage src={member.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div>
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    value={member.role}
                    onValueChange={(v) =>
                      handleRoleChange(member.userId, v as "COLLABORATOR" | "VISITOR")
                    }
                  >
                    <SelectTrigger className="h-7 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COLLABORATOR">{ROLE_LABELS.COLLABORATOR}</SelectItem>
                      <SelectItem value="VISITOR">{ROLE_LABELS.VISITOR}</SelectItem>
                    </SelectContent>
                  </Select>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={member.notifyByEmail}
                      onCheckedChange={(checked) =>
                        handleNotifyChange(member.userId, !!checked)
                      }
                      className="size-3.5"
                    />
                    <span className="text-xs text-muted-foreground">Notifier par email</span>
                  </label>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                onClick={() => handleRemove(member.userId)}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
              </Button>
            </div>
          ))}

          <Badge variant="secondary" className="text-xs">
            {totalCount} membre{totalCount > 1 ? "s" : ""} sélectionné{totalCount > 1 ? "s" : ""}
          </Badge>
        </div>
      )}
    </div>
  );
}
