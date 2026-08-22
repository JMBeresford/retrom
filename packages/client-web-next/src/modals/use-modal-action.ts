import { useCallback, useContext, useMemo } from "react";
import { ModalActionContext } from "./context";
import type { ModalName } from "./context";
import type { DialogHandle } from "@retrom/ui-next/components/dialog";

export type ModalHandles = typeof modalHandles;

const modalHandles: {
  [K in ModalName]?: DialogHandle<RetromModals.ModalActions[K]>;
} = {};

export function registerModalHandle<T extends keyof ModalHandles>(
  modal: T,
  handle: Exclude<ModalHandles[T], undefined>,
) {
  modalHandles[modal] = handle;
}

export function useModalAction<T extends ModalName>(modal: T) {
  const modalContext = useContext(ModalActionContext);
  if (!modalContext) {
    throw new Error("useModalAction must be used within a ModalActionProvider");
  }

  const { modals } = modalContext;

  const openModal = useCallback(
    (props: RetromModals.ModalActions[T]) => {
      const handle = modalHandles[modal];

      if (!handle) {
        console.error(`No handle registered for modal: ${modal}`);
      }

      handle?.openWithPayload(props);
    },
    [modal],
  );

  const closeModal = useCallback(() => {
    const handle = modalHandles[modal];

    handle?.close();
  }, [modal]);

  const modalState = useMemo(() => modals[modal], [modal, modals]);

  return useMemo(
    () => ({ openModal, modalState, closeModal }),
    [openModal, modalState, closeModal],
  );
}
