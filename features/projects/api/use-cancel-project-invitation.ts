import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { projectKeys } from "../keys";

type CancelProjectInvitationInput = {
  organizationSlug: string;
  projectSlug: string;
  invitationId: string;
};

export const useCancelProjectInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationSlug, projectSlug, invitationId }: CancelProjectInvitationInput) => {
      const res = await client.api.organizations[":organizationSlug"].projects[":projectSlug"].invitations[":invitationId"].cancel.$patch({
        param: { organizationSlug, projectSlug, invitationId },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Impossible d'annuler l'invitation");
      return data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Invitation annulée");
      queryClient.invalidateQueries({
        queryKey: projectKeys.invitations(variables.organizationSlug, variables.projectSlug),
      });
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
