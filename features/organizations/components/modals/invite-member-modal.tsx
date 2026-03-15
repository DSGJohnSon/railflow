"use client";

import ResponsiveModal from "@/components/ui/responsive-modal";
import InviteMemberForm from "../forms/invite-member-form";
import { useInviteMemberModal } from "../../hooks/use-invite-member-modal";

function InviteMemberModal() {
  const { isOpen, setIsOpen } = useInviteMemberModal();

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={() => setIsOpen(!isOpen)}
      title="Inviter un membre"
      description="Envoyez une invitation par email pour rejoindre votre organisation."
    >
      <InviteMemberForm />
    </ResponsiveModal>
  );
}

export default InviteMemberModal;
