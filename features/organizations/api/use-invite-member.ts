import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { organizationKeys } from "../keys";

type InviteMemberInput = {
  organizationSlug: string;
  json: {
    email: string;
    role: "ADMIN" | "MEMBER";
    expiresInHours: number;
  };
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationSlug, json }: InviteMemberInput) => {
      const res = await client.api.organizations[":organizationSlug"].invitations.$post({
        param: { organizationSlug },
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
        queryKey: organizationKeys.invitations(variables.organizationSlug),
      });
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
