import CreateOrganizationModal from "@/features/organizations/components/modals/create-organization-modal";
import CreateProjectModal from "@/features/projects/components/modals/create-project-modal";
import InviteMemberModal from "@/features/organizations/components/modals/invite-member-modal";
import InviteProjectMemberModal from "@/features/projects/components/modals/invite-project-member-modal";
import AddOrgMembersModal from "@/features/projects/components/modals/add-org-members-modal";
import React from "react";

function Modals() {
  return (
    <>
      <CreateOrganizationModal />
      <CreateProjectModal />
      <InviteMemberModal />
      <InviteProjectMemberModal />
      <AddOrgMembersModal />
    </>
  );
}

export default Modals;
