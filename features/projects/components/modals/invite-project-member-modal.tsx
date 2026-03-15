"use client";

import ResponsiveModal from "@/components/ui/responsive-modal";
import InviteProjectMemberForm from "../forms/invite-project-member-form";
import { useInviteProjectMemberModal } from "../../hooks/use-invite-project-member-modal";

function InviteProjectMemberModal() {
  const { isOpen, setIsOpen } = useInviteProjectMemberModal();

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={() => setIsOpen(!isOpen)}
      title="Inviter un membre"
      description="Envoyez une invitation par email pour rejoindre ce projet."
    >
      <InviteProjectMemberForm />
    </ResponsiveModal>
  );
}

export default InviteProjectMemberModal;
