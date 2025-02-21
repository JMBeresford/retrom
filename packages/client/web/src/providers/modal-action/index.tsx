import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

declare global {
  namespace RetromModals {
    export interface ModalActions {
      _?: BaseModalActionProps;
    }
  }
}

type ModalActionCallback<T> = T extends (args: infer U) => infer V
  ? (args: U) => V
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]) => any;

export type BaseModalActionProps<Open = undefined, Close = undefined> = {
  title?: string;
  description?: string;
  onOpen?: ModalActionCallback<Open>;
  onClose?: ModalActionCallback<Close>;
};

type ModalMap = {
  [K in keyof RetromModals.ModalActions]?: RetromModals.ModalActions[K];
};
export type ModalActionContext = {
  modals: ModalMap;
  setModalState: <T extends keyof RetromModals.ModalActions>(
    modal: T,
    state: RetromModals.ModalActions[T],
  ) => void;
};

const context = createContext<ModalActionContext | undefined>(undefined);

export function ModalActionProvider(props: PropsWithChildren) {
  const [modals, setModals] = useState<ModalMap>({});

  const setModalState: ModalActionContext["setModalState"] = useCallback(
    (modal, state) => {
      setModals((prev) => {
        prev[modal] = state;
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

export function useModalAction<T extends keyof RetromModals.ModalActions>(
  modal: T,
) {
  const modalContext = useContext(context);
  if (!modalContext) {
    throw new Error("useModalAction must be used within a ModalActionProvider");
  }

  const { modals, setModalState } = modalContext;
  const navigate = useNavigate();

  const openModal = useCallback(
    (props: RetromModals.ModalActions[T]) => {
      setModalState(modal, props);

      navigate({
        search: (prev) => ({
          ...prev,
          [modal]: { open: true, ...props },
        }),
      }).catch(console.error);
    },
    [navigate, modal, setModalState],
  );

  const modalState = modals[modal];

  return useMemo(() => ({ openModal, modalState }), [openModal, modalState]);
}
