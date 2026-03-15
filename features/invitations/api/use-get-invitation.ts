import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { invitationKeys } from "../keys";

export const useGetInvitation = (token: string) => {
  return useQuery({
    queryKey: invitationKeys.byToken(token),
    queryFn: async () => {
      const res = await client.api.invitations[":token"].$get({
        param: { token },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement de l'invitation");
      const json = await res.json();
      return json.data;
    },
  });
};
