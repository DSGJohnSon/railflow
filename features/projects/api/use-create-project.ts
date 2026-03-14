//TANSTACK & HONORPC
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

//KEYS
import { projectKeys } from "../keys";

//UTILITIES
import { toast } from "sonner";

//HOOKS
import { useRouter } from "next/navigation";

// END OF IMPORTS ------------------------------------------------------------------


/* type ResponseType = InferResponseType<
  (typeof client.api.organizations)[":organizationSlug"]["projects"]["$post"]
>; */
type RequestType = InferRequestType<
  (typeof client.api.organizations)[":organizationSlug"]["projects"]["$post"]
>;

export const useCreateProject = (organizationSlug: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ json } : RequestType) => {
      const response = await client.api.organizations[":organizationSlug"].projects.$post({ json, param: { organizationSlug } });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error ?? "Creation du projet impossible");
      }

      return data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      });
      router.push(`/org/${organizationSlug}/projects/${response.data.slug}/`);
      toast.success("Projet créé avec succès!", {
        description: response.data.name
      });
    },
    onError: (error) => {
      toast.error('Une erreur est survenue lors de la création du projet', {
        description: error.message
      })
    },
  });

  return mutation;
};
