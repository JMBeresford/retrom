import { subscribeToInstallationIndex } from "@retrom/plugin-installer";
import { checkIsDesktop } from "@/lib/env";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { create } from "@bufbuild/protobuf";
import {
  InstallationIndex,
  InstallationIndexSchema,
} from "@retrom/codegen/retrom/client/installation_pb";

const InstallationIndexContext = createContext<InstallationIndex>(
  create(InstallationIndexSchema, {}),
);

export function InstallationIndexProvider(props: PropsWithChildren) {
  const [index, setIndex] = useState<InstallationIndex>(
    create(InstallationIndexSchema, {}),
  );

  useEffect(() => {
    if (!checkIsDesktop()) return;

    subscribeToInstallationIndex((payload) => {
      setIndex(payload);
    }).catch(console.error);
  }, []);

  return (
    <InstallationIndexContext.Provider value={index}>
      {props.children}
    </InstallationIndexContext.Provider>
  );
}

export function useInstallationIndex() {
  return useContext(InstallationIndexContext);
}
