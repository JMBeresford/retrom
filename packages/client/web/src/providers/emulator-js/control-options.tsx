import { useToast } from "@/components/ui/use-toast";
import { EmulatorJS } from "@/lib/emulatorjs/emulator";
import { EJSControls } from "@/lib/emulatorjs/gamepad";
import { SetStateAction, useCallback, useMemo, useState } from "react";

export type ControlOptions = ReturnType<typeof useControlOptions>;

export function useControlOptions(emulatorJS: EmulatorJS) {
  const { toast } = useToast();

  // Hacky as all hell, no other way to leverage the existing
  // per-core button labeling emulatorJS does under the hood
  const labels = useMemo(() => {
    const elements = [
      ...emulatorJS.controlMenu
        .querySelectorAll('.ejs_control_body .ejs_control_bar[data-index="0"]')
        .values(),
    ];

    const labelsById: { id: string; label: string }[] = [];
    for (const el of elements) {
      const label = el.attributes.getNamedItem("data-label")?.value;
      const id = el.attributes.getNamedItem("data-id")?.value;

      if (id && label) {
        labelsById.push({ id, label });
      }
    }

    return labelsById;
  }, [emulatorJS]);

  const [bindings, _setBindings] = useState<EJSControls>(
    emulatorJS.controls ??
      emulatorJS.defaultControllers ?? { 0: {}, 1: {}, 2: {}, 3: {} },
  );

  const setBindings = useCallback(
    (cb: SetStateAction<EJSControls>) => {
      _setBindings(cb);

      emulatorJS.checkGamepadInputs();
      emulatorJS.saveSettings();
    },
    [emulatorJS],
  );

  const resetControls = useCallback(() => {
    try {
      emulatorJS.controls = JSON.parse(
        JSON.stringify(emulatorJS.defaultControllers),
      ) as EJSControls;

      emulatorJS.setupKeys();
      emulatorJS.checkGamepadInputs();
      emulatorJS.saveSettings();

      _setBindings(emulatorJS.controls);
      toast({
        title: "Controls Reset",
        description: "Controls have been reset to their default values.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Reset Controls Error",
        description:
          "An error occurred while resetting controls, please refresh and try again.",
        variant: "destructive",
      });
    }
  }, [emulatorJS, toast]);

  return { bindings, setBindings, labels, resetControls };
}
