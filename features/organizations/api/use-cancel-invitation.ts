import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { organizationKeys } from "../keys";

type CancelInvitationInput = {
  organizationSlug: string;
  invitationId: string;
};

export const useCancelInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationSlug, invitationId }: CancelInvitationInput) => {
      const res = await client.api.organizations[":organizationSlug"].invitations[":invitationId"].cancel.$patch({
        param: { organizationSlug, invitationId },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Impossible d'annuler l'invitation");
      return data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Invitation annulée");
      queryClient.invalidateQueries({
        queryKey: organizationKeys.invitations(variables.organizationSlug),
      });
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
