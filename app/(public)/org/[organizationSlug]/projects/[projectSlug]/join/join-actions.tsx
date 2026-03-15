"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAcceptProjectInvitation } from "@/features/projects/api/use-accept-project-invitation";
import { FolderLibraryIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const ROLE_LABELS: Record<string, string> = {
  COLLABORATOR: "Collaborateur",
  VISITOR: "Visiteur",
};

type ProjectInvitation = {
  id: string;
  token: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  project: { name: string; slug: string };
  invitedBy: { name: string; image: string | null };
} | null;

interface ProjectJoinActionsProps {
  invitation: ProjectInvitation;
  token: string;
  organizationSlug: string;
  projectSlug: string;
  organizationName: string;
  isAuthenticated: boolean;
}

export default function ProjectJoinActions({
  invitation,
  token,
  organizationSlug,
  projectSlug,
  organizationName,
  isAuthenticated,
}: ProjectJoinActionsProps) {
  const { mutate: accept, isPending } = useAcceptProjectInvitation(organizationSlug, projectSlug);

  const currentPath = `/org/${organizationSlug}/projects/${projectSlug}/join?token=${token}`;

  if (!invitation) {
    return (
      <div className="text-center space-y-4 rounded-xl border p-8">
        <div className="size-14 rounded-full bg-muted flex items-center justify-center mx-auto">
          <HugeiconsIcon icon={FolderLibraryIcon} className="size-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">Invitation introuvable</h1>
        <p className="text-sm text-muted-foreground">
          Ce lien d&apos;invitation n&apos;existe pas ou a déjà été utilisé.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    );
  }

  const isExpired =
    invitation.status === "PENDING" && new Date(invitation.expiresAt) < new Date();
  const isInvalid =
    invitation.status === "CANCELLED" || invitation.status === "ACCEPTED" || isExpired;

  if (isInvalid) {
    const message =
      invitation.status === "ACCEPTED"
        ? "Cette invitation a déjà été acceptée."
        : "Cette invitation a expiré ou a été annulée.";

    return (
      <div className="text-center space-y-4 rounded-xl border p-8">
        <div className="size-14 rounded-full bg-muted flex items-center justify-center mx-auto">
          <HugeiconsIcon icon={FolderLibraryIcon} className="size-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">Invitation non valide</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border p-8">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="size-14 rounded-full bg-muted flex items-center justify-center">
          <HugeiconsIcon icon={FolderLibraryIcon} className="size-7 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">
            Rejoindre <span className="text-lime-600">{invitation.project.name}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projet de l&apos;organisation <strong>{organizationName}</strong> sur Railflow.
          </p>
          {invitation.role && (
            <p className="text-xs text-muted-foreground mt-1">
              Rôle attribué : <strong>{ROLE_LABELS[invitation.role] ?? invitation.role}</strong>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
        <Avatar size="sm">
          <AvatarImage
            src={invitation.invitedBy.image ?? undefined}
            alt={invitation.invitedBy.name}
          />
          <AvatarFallback>
            {invitation.invitedBy.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm text-muted-foreground">
          Invité(e) par <strong className="text-foreground">{invitation.invitedBy.name}</strong>
        </p>
      </div>

      <div className="space-y-3">
        {isAuthenticated ? (
          <Button
            className="w-full"
            onClick={() => accept(token)}
            disabled={isPending}
          >
            {isPending ? "Rejoindre en cours..." : "Rejoindre le projet"}
          </Button>
        ) : (
          <>
            <Button className="w-full" asChild>
              <Link href={`/login?redirectTo=${encodeURIComponent(currentPath)}`}>
                Se connecter pour rejoindre
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/register?redirectTo=${encodeURIComponent(currentPath)}`}>
                Créer un compte
              </Link>
            </Button>
          </>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Lien valide jusqu&apos;au{" "}
        {new Date(invitation.expiresAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
