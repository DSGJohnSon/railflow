// TANSTACK & HONO RPC
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

// QUERY KEYS
import { projectKeys } from "../keys";

// END OF IMPORTS ----------------------------------

export const useGetMyProjects = () => {
  const query = useQuery({
    queryKey: projectKeys.me,
    queryFn: async () => {
      const response = await client.api.users.me.projects.$get();

      if (!response.ok) {
        throw new Error(
          "Récupération de vos organisations impossible - Veuillez réessayer",
        );
      }

      const data = await response.json();
      return data;
    },
  });
  return query;
};
