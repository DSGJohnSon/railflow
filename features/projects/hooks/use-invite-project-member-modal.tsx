import { useQueryState, parseAsBoolean } from "nuqs";

export const useInviteProjectMemberModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "invite-project-member",
    parseAsBoolean.withDefault(false),
  );

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    setIsOpen,
  };
};
