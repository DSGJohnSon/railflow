"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "../api/use-logout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loader, LogOut, X } from "@hugeicons/core-free-icons";

function LogoutButton({ className }: { className?: string }) {
  const { mutate: logout, isPending } = useLogout();

  return (
    <Button onClick={() => logout()} disabled={isPending} className={className}>
      {isPending ? (
        <>
          <HugeiconsIcon icon={Loader} className="size-4 animate-spin" />
          Déconnexion...
        </>
      ) : (
        <>
          <HugeiconsIcon icon={LogOut} className="size-4" />
          Se deconnecter
        </>
      )}
    </Button>
  );
}

export function NotMeButton({ textClassName, iconClassName }: { textClassName?: string, iconClassName?: string }) {
  const { mutate: logout, isPending } = useLogout();
  return (  
    <Button
      variant={"link"}
      size={"sm"}
      onClick={() => logout()}
      disabled={isPending}
      className={`flex items-center gap-2 ${textClassName}`}
    >
      <HugeiconsIcon icon={X} className={iconClassName} />
      {isPending ? "Déconnexion..." : "Ce n'est pas moi"}
    </Button>
  );
}

export default LogoutButton;
