import {
  useMemo,
  useState,
  useCallback,
  createContext,
  PropsWithChildren,
  useContext,
} from "react";
import { useEmulatorJS } from ".";

export type CoreOption = { value: string; allValues: string[] };
export type CoreOptions = {
  coreOptions: Record<string, CoreOption>;
  setCoreOption: (option: string, value: string) => void;
};

const CoreOptionsContext = createContext<CoreOptions | undefined>(undefined);

export function CoreOptionsProvider(props: PropsWithChildren) {
  const emulatorJS = useEmulatorJS();
  const initialCoreOptions = useMemo(() => {
    if (!emulatorJS) return {};

    try {
      const rawOptions =
        emulatorJS.gameManager?.getCoreOptions()?.split("\n") ?? [];
      const parsedOptions: Record<string, CoreOption> = {};

      rawOptions.forEach((line) => {
        const [labelAndDefault, allValues] = line
          .split(";")
          .map((v) => v.trim());
        const [label, defaultValue] = labelAndDefault
          .split("|")
          .map((v) => v.trim());
        const values = allValues.split("|").map((v) => v.trim());
        parsedOptions[label] = { value: defaultValue, allValues: values };
      });

      return parsedOptions;
    } catch (e) {
      console.error("Failed to parse core options:", e);
      return {};
    }
  }, [emulatorJS]);

  const [coreOptions, setCoreOptions] = useState(initialCoreOptions);

  const setCoreOption = useCallback(
    (option: string, value: string) => {
      setCoreOptions((prevOptions) => ({
        ...prevOptions,
        [option]: { ...prevOptions[option], value },
      }));

      if (emulatorJS) {
        emulatorJS.changeSettingOption(option, value);
        emulatorJS.menuOptionChanged(option, value);
      }
    },
    [emulatorJS],
  );

  const value: CoreOptions = useMemo(
    () => ({ coreOptions, setCoreOption }),
    [setCoreOption, coreOptions],
  );

  return (
    <CoreOptionsContext.Provider value={value}>
      {props.children}
    </CoreOptionsContext.Provider>
  );
}

export function useCoreOptions() {
  const ctx = useContext(CoreOptionsContext);
  if (!ctx) {
    throw new Error("useCoreOptions must be used within a CoreOptionsProvider");
  }

  return ctx;
}
