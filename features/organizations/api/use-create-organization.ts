import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { organizationKeys } from "../keys";

type ResponseType = InferResponseType<
  (typeof client.api.organizations)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.organizations)["$post"]
>;

export const useCreateOrganization = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ json }: RequestType) => {
      const response = await client.api.organizations.$post({ json });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error ?? "Creation de l'organisation impossible");
      }

      return data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.all,
      });

      router.push(`/org/${response.data.slug}/`);

      toast.success("Organisation creee avec succes!", {
        description: response.data.name,
      });
    },
    onError: (error) => {
      toast.error("Une erreur est survenue lors de la creation de l'organisation", {
        description: error.message,
      });
    },
  });

  return mutation;
};
