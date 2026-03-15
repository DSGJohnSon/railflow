import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { projectKeys } from "../keys";

type InviteProjectMemberInput = {
  organizationSlug: string;
  projectSlug: string;
  json: {
    email: string;
    role: "COLLABORATOR" | "VISITOR";
    expiresInHours: number;
  };
};

export const useInviteProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationSlug, projectSlug, json }: InviteProjectMemberInput) => {
      const res = await client.api.organizations[":organizationSlug"].projects[":projectSlug"].invitations.$post({
        param: { organizationSlug, projectSlug },
        json,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Impossible d'envoyer l'invitation");
      return data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Invitation envoyée", {
        description: `Un email d'invitation a été envoyé à ${variables.json.email}.`,
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.invitations(variables.organizationSlug, variables.projectSlug),
      });
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
