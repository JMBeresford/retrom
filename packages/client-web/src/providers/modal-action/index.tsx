import { Prettify } from "@/utils/typescript";
import {
  createContext,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type * from "./modals";

export type ModalName = keyof RetromModals.ModalActions;
type ModalMap = {
  [K in ModalName]?: RetromModals.ModalActions[K];
};

export type ModalActionContext = {
  modals: ModalMap;
  setModalState: <T extends ModalName>(
    modal: T,
    cb: SetStateAction<ModalMap[T]>,
  ) => void;
};

const context = createContext<ModalActionContext | undefined>(undefined);

export function ModalActionProvider(props: PropsWithChildren) {
  const [modals, setModals] = useState<ModalMap>({});

  const setModalState: ModalActionContext["setModalState"] = useCallback(
    (modal, cb) => {
      setModals((prev) => {
        const next = typeof cb === "function" ? cb(prev[modal]) : cb;
        prev[modal] = next;

        return { ...prev };
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ modals, setModalState }),
    [modals, setModalState],
  );

  return <context.Provider value={value}>{props.children}</context.Provider>;
}

export function useModalAction<T extends ModalName>(modal: T) {
  const modalContext = useContext(context);
  if (!modalContext) {
    throw new Error("useModalAction must be used within a ModalActionProvider");
  }

  const { modals, setModalState } = modalContext;

  const openModal = useCallback(
    (props?: Prettify<Omit<RetromModals.ModalActions[T], "open">>) => {
      setModalState(modal, (prev) => ({
        ...prev,
        ...props,
        open: true,
      }));
    },
    [modal, setModalState],
  );

  const closeModal = useCallback(
    (props?: Prettify<Omit<RetromModals.ModalActions[T], "open">>) => {
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
