import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["current"],
      });
      router.push("/workspaces/hello");
    },
  });

  return mutation;
};
