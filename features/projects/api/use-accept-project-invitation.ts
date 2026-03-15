import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { projectKeys } from "../keys";
import { organizationKeys } from "@/features/organizations/keys";

export const useAcceptProjectInvitation = (organizationSlug: string, projectSlug: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const res = await client.api.organizations[":organizationSlug"].projects[":projectSlug"].join.accept.$post({
        param: { organizationSlug, projectSlug },
        json: { token },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Impossible de rejoindre le projet");
      return json.data;
    },
    onSuccess: (data) => {
      toast.success("Bienvenue !", {
        description: "Vous avez rejoint le projet avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.me });
      queryClient.invalidateQueries({ queryKey: organizationKeys.me });
      router.push(`/org/${data.organizationSlug}/projects/${data.projectSlug}`);
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
