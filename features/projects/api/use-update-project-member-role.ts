import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { projectKeys } from "../keys";

type UpdateProjectMemberRoleInput = {
  organizationSlug: string;
  projectSlug: string;
  memberId: string;
  json: { role: "ADMIN" | "COLLABORATOR" | "VISITOR" };
};

export const useUpdateProjectMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationSlug, projectSlug, memberId, json }: UpdateProjectMemberRoleInput) => {
      const res = await client.api.organizations[":organizationSlug"].projects[":projectSlug"].members[":memberId"].$patch({
        param: { organizationSlug, projectSlug, memberId },
        json,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Impossible de modifier le rôle");
      return data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Rôle mis à jour");
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(variables.organizationSlug, variables.projectSlug),
      });
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
