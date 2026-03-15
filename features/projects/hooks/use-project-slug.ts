import { useParams } from "next/navigation";

export const useGetProjectSlug = () => {
  const params = useParams();
  return params.projectSlug as string;
};
