import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { authKeys } from "../keys";

export const useCurrent = () => {
  const query = useQuery({
    queryKey: authKeys.current,
    queryFn: async () => {
      const session = await authClient.getSession();

      if (!session || !session.data) {
        return null;
      }

      return session.data.user;
    },
  });

  return query;
};
