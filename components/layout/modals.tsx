import CreateOrganizationModal from "@/features/organizations/components/modals/create-organization-modal";
import CreateProjectModal from "@/features/projects/components/modals/create-project-modal";
import InviteMemberModal from "@/features/organizations/components/modals/invite-member-modal";
import React from "react";

function Modals() {
  return (
    <>
      <CreateOrganizationModal />
      <CreateProjectModal />
      <InviteMemberModal />
    </>
  );
}

export default Modals;
