import { useCurrent } from "@/features/auth/api/use-current";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.organizations)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.organizations)["$post"]
>;

export const useCreateOrganization = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.organizations.$post({ json });
      return await response.json();
    },
    onSuccess: (response) => {
      if ("error" in response) throw new Error(response.error);

      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });
      router.push(`/org/${response.data.slug}/`);
      toast.success("Workspace créé avec succès!", {
        description: response.data.name
      });
    },
    onError: (error) => {
      toast.error('Une erreur est survenue lors de la création du workspace', {
        description: error.message
      })
    },
  });

  return mutation;
};
