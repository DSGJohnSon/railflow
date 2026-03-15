import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { projectKeys } from "../keys";

export const useGetAvailableOrgMembers = (organizationSlug: string, projectSlug: string) => {
  return useQuery({
    queryKey: projectKeys.availableMembers(organizationSlug, projectSlug),
    queryFn: async () => {
      const res = await client.api.organizations[":organizationSlug"].projects[":projectSlug"].members.available.$get({
        param: { organizationSlug, projectSlug },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des membres disponibles");
      const json = await res.json();
      return json.data;
    },
    enabled: !!organizationSlug && !!projectSlug,
  });
};
