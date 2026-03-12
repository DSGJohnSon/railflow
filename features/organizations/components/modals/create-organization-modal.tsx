"use client";

import ResponsiveModal from "@/components/ui/responsive-modal";
import CreateOrganizationForm from "../forms/create-organization-form";
import { useCreateOrganizationModal } from "../../hooks/use-create-organization-modal";

function CreateOrganizationModal() {
  const { isOpen, setIsOpen } = useCreateOrganizationModal();

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(!isOpen);
      }}
      title={"Création d'une organisation"}
      description=""
    >
      <CreateOrganizationForm />
    </ResponsiveModal>
  );
}

export default CreateOrganizationModal;
