import { useQueryState, parseAsBoolean } from "nuqs";

export const useInviteMemberModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "invite-member",
    parseAsBoolean.withDefault(false),
  );

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    setIsOpen,
  };
};
