import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { invitationKeys } from "../keys";
import { organizationKeys } from "@/features/organizations/keys";

export const useAcceptInvitation = (token: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await client.api.invitations[":token"].accept.$post({
        param: { token },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Impossible de rejoindre l'organisation");
      return json.data;
    },
    onSuccess: (data) => {
      toast.success("Bienvenue !", {
        description: "Vous avez rejoint l'organisation avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: invitationKeys.byToken(token) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.me });
      router.push(`/org/${data.organizationSlug}`);
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
