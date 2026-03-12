import { getCurrent } from "@/features/auth/actions";
import CreateOrganizationModal from "@/features/organizations/components/modals/create-organization-modal";

interface AdminLayoutProps {
  children: React.ReactNode;
}

async function AdminLayout({ children }: AdminLayoutProps) {

  return (
    <>
      <CreateOrganizationModal />
      {children}
    </>
  );
}

export default AdminLayout;
