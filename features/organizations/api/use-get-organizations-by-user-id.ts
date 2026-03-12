import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.organizations.me)["$get"]
>;
type RequestType = InferRequestType<
  (typeof client.api.organizations.me)["$get"]
>;

export const useGetOrganizationsByUserId = ({
    userId,
}: {
    userId: string;
}) => {
    const query = useQuery({
        queryKey: ["organizations", userId],
        queryFn: async () => {  
            const response = await client.api.organizations.me.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch your organizations");
            }

            const data = await response.json();

            return data;
        }
    })

    return query;
}
