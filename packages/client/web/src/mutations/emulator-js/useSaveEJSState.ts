import { useToast } from "@/components/ui/use-toast";
import { useEmulatorJS } from "@/providers/emulator-js";
import { useRemoteFiles } from "@/routes/play/$gameId/_layout/-utils/useRemoteFiles";
import { FilesystemNodeType } from "@retrom/codegen/retrom/file-explorer";
import { File } from "@retrom/codegen/retrom/files";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSaveEJSState() {
  const { toast } = useToast();
  const emulatorJS = useEmulatorJS();
  const queryClient = useQueryClient();
  const { uploadFiles } = useRemoteFiles();

  return useMutation({
    mutationFn: async (args: {
      core: string;
      gameId: number;
      slot: number;
    }) => {
      const { core, gameId, slot } = args;
      if (!emulatorJS.gameManager) {
        toast({
          title: "Failed to save state",
          description: "Is the game running?",
          variant: "destructive",
        });

        return;
      }

      emulatorJS.changeSettingOption("save-state-slot", slot.toString());
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
        emulatorJS.callEvent("saveState", { state, screenshot });
        const stateFile: File = {
          content: state,
          stat: {
            path: `states/${core}/${gameId}/${slot}.state`,
            nodeType: FilesystemNodeType.FILE,
          },
        };

        const screenshotFile: File = {
          content: screenshot,
          stat: {
            nodeType: FilesystemNodeType.FILE,
            path: `states/${core}/${gameId}/${slot}.png`,
          },
        };

        await uploadFiles.mutateAsync([stateFile, screenshotFile]);

        toast({
          title: `Saved state`,
          description: `Save state has been synced to slot ${slot}`,
        });

        queryClient
          .refetchQueries({
            queryKey: ["save-state", { core, gameId, slot }],
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
