import { useCallback, useContext, useMemo } from "react";
import { ModalActionContext } from "./context";
import type { ModalName } from "./context";

export function useModalAction<T extends ModalName>(modal: T) {
  const modalContext = useContext(ModalActionContext);
  if (!modalContext) {
    throw new Error("useModalAction must be used within a ModalActionProvider");
  }

  const { modals, setModalState } = modalContext;

  const openModal = useCallback(
    (props?: Omit<RetromModals.ModalActions[T], "open">) => {
      setModalState(modal, (prev) => ({
        ...prev,
        ...props,
        open: true,
      }));
    },
    [modal, setModalState],
  );

  const closeModal = useCallback(
    (props?: Omit<RetromModals.ModalActions[T], "open">) => {
      setModalState(modal, (prev) => ({ ...prev, ...props, open: false }));
    },
    [setModalState, modal],
  );

  const modalState = useMemo(() => modals[modal], [modal, modals]);

  return useMemo(
    () => ({ openModal, modalState, closeModal }),
    [openModal, modalState, closeModal],
  );
}
