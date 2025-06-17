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
      unused?: BaseModalActionProps;
    }
  }
}

type ModalActionCallback<T> = T extends (args: infer U) => infer V
  ? (args: U) => V
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]) => any;

export type BaseModalActionProps<Open = undefined, Close = undefined> = {
  open: boolean;
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
    cb:
      | RetromModals.ModalActions[T]
      | ((prev: RetromModals.ModalActions[T]) => RetromModals.ModalActions[T]),
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

export function useModalAction<T extends keyof RetromModals.ModalActions>(
  modal: T,
) {
  const modalContext = useContext(context);
  if (!modalContext) {
    throw new Error("useModalAction must be used within a ModalActionProvider");
  }

  const { modals, setModalState } = modalContext;

  const openModal = useCallback(
    (props: RetromModals.ModalActions[T] & { open?: never }) => {
      setModalState(modal, (prev) => ({ ...prev, ...props, open: true }));
    },
    [modal, setModalState],
  );

  const closeModal = useCallback(
    (props?: RetromModals.ModalActions[T] & { open?: never }) => {
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
