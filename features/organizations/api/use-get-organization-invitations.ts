import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { organizationKeys } from "../keys";

export const useGetOrganizationInvitations = (organizationSlug: string) => {
  return useQuery({
    queryKey: organizationKeys.invitations(organizationSlug),
    queryFn: async () => {
      const res = await client.api.organizations[":organizationSlug"].invitations.$get({
        param: { organizationSlug },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des invitations");
      const json = await res.json();
      return json.data;
    },
  });
};
