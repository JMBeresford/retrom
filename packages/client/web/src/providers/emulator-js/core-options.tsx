import { useMemo, useState, useCallback } from "react";
import { EmulatorJS } from "@/lib/emulatorjs/emulator";

type Option = { value: string; allValues: string[] };
export type CoreOptions = {
  coreOptions: Record<string, Option>;
  setCoreOption: (option: string, value: string) => void;
};

export function useCoreOptions(emulatorJS?: EmulatorJS): CoreOptions {
  const initialCoreOptions = useMemo(() => {
    if (!emulatorJS) return {};

    const rawOptions =
      emulatorJS.gameManager?.getCoreOptions()?.split("\n") ?? [];
    const parsedOptions: Record<string, Option> = {};

    rawOptions.forEach((line) => {
      const [labelAndDefault, allValues] = line.split(";").map((v) => v.trim());
      const [label, defaultValue] = labelAndDefault
        .split("|")
        .map((v) => v.trim());
      const values = allValues.split("|").map((v) => v.trim());
      parsedOptions[label] = { value: defaultValue, allValues: values };
    });

    return parsedOptions;
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

  return { coreOptions, setCoreOption };
}
