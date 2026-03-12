import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateOrganizationModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-organization",
    parseAsBoolean.withDefault(false).withOptions({
      clearOnDefault: true,
    })
  )

  const open = () => {
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    open,
    close,
    setIsOpen
  }
};
