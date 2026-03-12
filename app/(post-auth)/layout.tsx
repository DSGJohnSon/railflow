import { getCurrent } from "@/features/auth/actions";
import CreateOrganizationModal from "@/features/organizations/components/modals/create-organization-modal";

interface PostAuthLayoutProps {
  children: React.ReactNode;
}

async function PostAuthLayout({ children }: PostAuthLayoutProps) {
  const user = await getCurrent();
  if (!user) return null;

  return (
    <>
      <CreateOrganizationModal />
      {children}
    </>
  );
}

export default PostAuthLayout;
