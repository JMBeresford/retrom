import { useEmulatorJS } from "@/providers/emulator-js";
import { useSaveEJSState } from "./useSaveEJSState";
import { useMutation } from "@tanstack/react-query";

export function useImportEJSState() {
  const emulatorJS = useEmulatorJS();
  const { mutateAsync: saveState } = useSaveEJSState();

  return useMutation({
    mutationKey: ["import-save-state"],
    mutationFn: async (args: {
      slot: number;
      core: string;
      gameId: number;
    }) => {
      const { slot, core, gameId } = args;
      const el = document.createElement("input");

      const file = await new Promise<File>((resolve, reject) => {
        el.type = "file";
        el.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (!file) {
            return reject(new Error("No file selected"));
          }

          resolve(file);
        };

        el.click();
      });

      const data = await file.arrayBuffer();
      emulatorJS.changeSettingOption("save-state-slot", slot.toString());
      emulatorJS.gameManager?.loadState(new Uint8Array(data));
      el.remove();
      return saveState({ core, slot, gameId });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
