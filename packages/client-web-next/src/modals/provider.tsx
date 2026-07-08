import { useCallback, useMemo, useState } from "react";
import { ModalActionContext } from "./context";
import type { ModalActionState, ModalMap } from "./context";
import type { PropsWithChildren } from "react";

export function ModalActionProvider(props: PropsWithChildren) {
  const [modals, setModals] = useState<ModalMap>({});

  const setModalState: ModalActionState["setModalState"] = useCallback(
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

  return (
    <ModalActionContext.Provider value={value}>
      {props.children}
    </ModalActionContext.Provider>
  );
}
