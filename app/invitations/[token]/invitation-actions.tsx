"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAcceptInvitation } from "@/features/invitations/api/use-accept-invitation";
import { Building04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type Invitation = {
  id: string;
  token: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  organization: { name: string; slug: string };
  invitedBy: { name: string; image: string | null };
} | null;

interface InvitationActionsProps {
  invitation: Invitation;
  token: string;
  isAuthenticated: boolean;
}

export default function InvitationActions({
  invitation,
  token,
  isAuthenticated,
}: InvitationActionsProps) {
  const { mutate: accept, isPending } = useAcceptInvitation(token);

  if (!invitation) {
    return (
      <div className="text-center space-y-4 rounded-xl border p-8">
        <div className="size-14 rounded-full bg-muted flex items-center justify-center mx-auto">
          <HugeiconsIcon icon={Building04Icon} className="size-7 text-muted-foreground" />
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
          <HugeiconsIcon icon={Building04Icon} className="size-7 text-muted-foreground" />
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
          <HugeiconsIcon icon={Building04Icon} className="size-7 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">
            Rejoindre <span className="text-lime-600">{invitation.organization.name}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vous avez été invité(e) à rejoindre cette organisation sur Railflow.
          </p>
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
            onClick={() => accept()}
            disabled={isPending}
          >
            {isPending ? "Rejoindre en cours..." : "Rejoindre l'organisation"}
          </Button>
        ) : (
          <>
            <Button className="w-full" asChild>
              <Link href={`/login?redirectTo=/invitations/${token}`}>
                Se connecter pour rejoindre
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/register?redirectTo=/invitations/${token}`}>
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
