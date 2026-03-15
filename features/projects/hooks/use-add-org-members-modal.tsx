"use client";

import { useQueryState, parseAsBoolean } from "nuqs";

export function useAddOrgMembersModal() {
  const [isOpen, setIsOpen] = useQueryState(
    "add-org-members",
    parseAsBoolean.withDefault(false),
  );

  return {
    isOpen: !!isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(null),
  };
}
