import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["current"],
      });
    },
  });

  return mutation;
};
