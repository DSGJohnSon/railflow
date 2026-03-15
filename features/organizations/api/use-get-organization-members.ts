import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { organizationKeys } from "../keys";

export const useGetOrganizationMembers = (organizationSlug: string) => {
  return useQuery({
    queryKey: organizationKeys.members(organizationSlug),
    queryFn: async () => {
      const res = await client.api.organizations[":organizationSlug"].members.$get({
        param: { organizationSlug },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des membres");
      const json = await res.json();
      return json.data;
    },
  });
};
