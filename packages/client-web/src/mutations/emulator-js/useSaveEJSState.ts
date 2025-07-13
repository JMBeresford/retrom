import { toast } from "@retrom/ui/hooks/use-toast";
import { useEmulatorJS } from "@/providers/emulator-js";
import { FilesystemNodeType } from "@retrom/codegen/retrom/file-explorer_pb";
import { File } from "@retrom/codegen/retrom/files_pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpdateSaveStates } from "../saveStates";
import { RawMessage } from "@/utils/protos";

export function useSaveEJSState() {
  const emulatorJS = useEmulatorJS();
  const queryClient = useQueryClient();
  const { mutateAsync: update } = useUpdateSaveStates();

  return useMutation({
    mutationFn: async (args: {
      emulatorId: number;
      gameId: number;
      slot: number;
    }) => {
      const { emulatorId, gameId, slot } = args;
      if (!emulatorJS.gameManager) {
        toast({
          title: "Failed to save state",
          description: "Is the game running?",
          variant: "destructive",
        });

        return;
      }

      const state = emulatorJS.gameManager.getState();
      try {
        emulatorJS.gameManager.FS.unlink("screenshot.png");
      } catch (e) {
        console.warn(e);
      }
      emulatorJS.gameManager.functions.screenshot();

      let screenshot: Uint8Array | undefined;
      while (true) {
        try {
          emulatorJS.gameManager.FS.stat("/screenshot.png");
          screenshot = emulatorJS.gameManager.FS.readFile("/screenshot.png");
          break;
        } catch (e) {
          console.warn(e);
        }

        await new Promise((r) => setTimeout(r, 10));
      }

      if (state && screenshot) {
        const stateFile: RawMessage<File> = {
          content: state,
          stat: {
            path: `${slot}.state`,
            nodeType: FilesystemNodeType.FILE,
          },
        };

        const screenshotFile: RawMessage<File> = {
          content: screenshot,
          stat: {
            nodeType: FilesystemNodeType.FILE,
            path: `${slot}.png`,
          },
        };

        await update({
          saveStatesSelectors: [
            { gameId, emulatorId, files: [stateFile, screenshotFile] },
          ],
        });

        toast({
          title: `Saved state`,
          description: `Save state has been synced to slot ${slot}`,
        });

        queryClient
          .invalidateQueries({
            predicate: ({ queryKey }) =>
              ["getSaveStates", "statSaveStates"].some((k) =>
                queryKey.includes(k),
              ),
          })
          .catch(console.error);
      } else {
        toast({
          title: "Failed to save state",
          description: "Could not extract state info",
          variant: "destructive",
        });
      }
    },
  });
}
