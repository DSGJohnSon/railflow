import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { organizationKeys } from "../keys";

export const useAcceptOrgInvitation = (organizationSlug: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const res = await client.api.organizations[":organizationSlug"].join.accept.$post({
        param: { organizationSlug },
        json: { token },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Impossible de rejoindre l'organisation");
      return json.data;
    },
    onSuccess: (data) => {
      toast.success("Bienvenue !", {
        description: "Vous avez rejoint l'organisation avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: organizationKeys.me });
      router.push(`/org/${data.organizationSlug}`);
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });
};
