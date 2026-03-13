// TANSTACK & HONO RPC
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

// QUERY KEYS
import { organizationKeys } from "../keys";

// END OF IMPORTS ----------------------------------

export const useGetMyOrganizations = () => {
  const query = useQuery({
    queryKey: organizationKeys.me,
    queryFn: async () => {
      const response = await client.api.users.me.organizations.$get();

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
