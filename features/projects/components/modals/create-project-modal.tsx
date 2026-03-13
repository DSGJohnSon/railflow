"use client";

import ResponsiveModal from "@/components/ui/responsive-modal";
import CreateProjectForm from "../forms/create-project-form";
import { useCreateProjectModal } from "../../hooks/use-create-project-modal";

function CreateProjectModal() {
  const { isOpen, setIsOpen } = useCreateProjectModal();

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(!isOpen);
      }}
      title={"Création d'un projet"}
      description=""
    >
      <CreateProjectForm />
    </ResponsiveModal>
  );
}

export default CreateProjectModal;
