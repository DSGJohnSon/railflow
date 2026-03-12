import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    any,
    Error,
    { json: { email: string; password: string; name: string } }
  >({
    mutationFn: async ({ json }) => {
      const result = await authClient.signUp.email({
        email: json.email,
        password: json.password,
        name: json.name,
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Inscription réussie", {
        description: "Redirection vers votre espace...",
      });
      queryClient.invalidateQueries({
        queryKey: ["current"],
      });
      router.refresh();
    },
    onError: (error) => {
      toast.error("Erreur d'inscription", {
        description: error.message,
      });
    },
  });

  return mutation;
};
