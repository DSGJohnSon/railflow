import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { projectKeys } from "../keys";

type RemoveProjectMemberInput = {
  organizationSlug: string;
  projectSlug: string;
  memberId: string;
};

export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationSlug, projectSlug, memberId }: RemoveProjectMemberInput) => {
      const res = await client.api.organizations[":organizationSlug"].projects[":projectSlug"].members[":memberId"].$delete({
        param: { organizationSlug, projectSlug, memberId },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Impossible de retirer ce membre");
      return data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Membre retiré du projet");
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(variables.organizationSlug, variables.projectSlug),
      });
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
