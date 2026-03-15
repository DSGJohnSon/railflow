import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { organizationKeys } from "../keys";

type UpdateMemberRoleInput = {
  organizationSlug: string;
  memberId: string;
  json: { role: "ADMIN" | "MEMBER" };
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationSlug, memberId, json }: UpdateMemberRoleInput) => {
      const res = await client.api.organizations[":organizationSlug"].members[":memberId"].$patch({
        param: { organizationSlug, memberId },
        json,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Impossible de modifier le rôle");
      return data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Rôle mis à jour");
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members(variables.organizationSlug),
      });
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
