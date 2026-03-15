import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { projectKeys } from "../keys";

type AddOrgMembersInput = {
  organizationSlug: string;
  projectSlug: string;
  json: {
    members: { userId: string; role: "COLLABORATOR" | "VISITOR"; notifyByEmail?: boolean }[];
  };
};

export const useAddOrgMembersToProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationSlug, projectSlug, json }: AddOrgMembersInput) => {
      const res = await client.api.organizations[":organizationSlug"].projects[":projectSlug"].members.bulk.$post({
        param: { organizationSlug, projectSlug },
        json,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Impossible d'ajouter les membres");
      return data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Membres ajoutés au projet");
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(variables.organizationSlug, variables.projectSlug),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.availableMembers(variables.organizationSlug, variables.projectSlug),
      });
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
