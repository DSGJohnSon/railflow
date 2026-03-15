import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { organizationKeys } from "../keys";

type RemoveMemberInput = {
  organizationSlug: string;
  memberId: string;
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationSlug, memberId }: RemoveMemberInput) => {
      const res = await client.api.organizations[":organizationSlug"].members[":memberId"].$delete({
        param: { organizationSlug, memberId },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Impossible de retirer ce membre");
      return data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Membre retiré de l'organisation");
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members(variables.organizationSlug),
      });
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
