"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const FLASH_MESSAGES: Record<string, { title: string; description?: string }> = {
  "not-member": {
    title: "Accès refusé",
    description: "Vous n'êtes pas membre de cette organisation.",
  },
  "not-project-member": {
    title: "Accès refusé",
    description: "Vous n'êtes pas membre de ce projet.",
  },
};

export function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const flash = searchParams.get("flash");
    if (!flash) return;

    const message = FLASH_MESSAGES[flash];
    if (message) {
      toast.error(message.title, { description: message.description });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("flash");
    const newUrl = params.size > 0 ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);
  }, [searchParams, router]);

  return null;
}
