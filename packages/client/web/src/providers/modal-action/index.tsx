import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

declare global {
  namespace RetromModals {
    export interface ModalActions {
      setupModal?: ModalActionProps;
    }
  }
}

type ModalActionCallback<T> = T extends (args: infer U) => infer V
  ? (args: U) => V
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]) => any;

export type ModalActionProps<Open = undefined, Close = undefined> = {
  title?: string;
  description?: string;
  onOpen?: ModalActionCallback<Open>;
  onClose?: ModalActionCallback<Close>;
};

export type ModalActionContext = {
  openModal: <Key extends keyof RetromModals.ModalActions>(
    key: Key,
    props: RetromModals.ModalActions[Key],
  ) => void;

  activeModalProps?: ModalActionProps;
};

const context = createContext<ModalActionContext | undefined>(undefined);

export function ModalActionProvider(props: React.PropsWithChildren) {
  const [activeModalProps, setActiveModalProps] = useState<
    ModalActionProps | undefined
  >();
  const navigate = useNavigate();

  const openModal: ModalActionContext["openModal"] = useCallback(
    (key, props) => {
      const { title, description } = props ?? {};
      setActiveModalProps(props);

      void navigate({
        search: (prev) => ({
          ...prev,
          [key]: { open: true, title, description },
        }),
      });
    },
    [navigate],
  );

  const value = useMemo(
    () => ({ openModal, activeModalProps }),
    [openModal, activeModalProps],
  );

  return <context.Provider value={value} {...props} />;
}

export function useModalAction() {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error("useModalAction must be used within a ModalActionProvider");
  }

  return ctx;
}
