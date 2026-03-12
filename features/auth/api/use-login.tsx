import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    any,
    Error,
    { json: { email: string; password: string } }
  >({
    mutationFn: async ({ json }) => {
      const result = await authClient.signIn.email({
        email: json.email,
        password: json.password,
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Connexion réussie", {
        description: "Redirection vers votre espace...",
      });
      queryClient.invalidateQueries({
        queryKey: ["current"],
      });
      router.refresh();
    },
    onError: (error) => {
      toast.error("Erreur de connexion", {
        description: error.message
      });
    },
  });

  return mutation;
};
