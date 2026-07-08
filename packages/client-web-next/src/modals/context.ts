import { createContext } from "react";
import type { SetStateAction } from "react";

export type ModalName = keyof RetromModals.ModalActions;
export type ModalMap = {
  [K in ModalName]?: RetromModals.ModalActions[K];
};

export type ModalActionState = {
  modals: ModalMap;
  setModalState: <T extends ModalName>(
    modal: T,
    cb: SetStateAction<ModalMap[T]>,
  ) => void;
};

export const ModalActionContext = createContext<ModalActionState | undefined>(
  undefined,
);
