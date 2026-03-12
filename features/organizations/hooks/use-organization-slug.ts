import { useParams } from "next/navigation";

export const useGetOrganizationSlug = () => {
    const params = useParams();
    return params.organizationSlug as string;
};