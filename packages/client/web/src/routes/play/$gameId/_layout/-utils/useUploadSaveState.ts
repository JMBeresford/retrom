import { FilesystemNodeType } from "@/generated/retrom/file-explorer";
import { File } from "@/generated/retrom/files";
import { Core } from "@/lib/emulatorjs";
import { EmulatorJS } from "@/lib/emulatorjs/emulator";
import { useGameDetail } from "@/providers/game-details";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useRemoteFiles } from "./useRemoteFiles";
import { useApiUrl } from "@/utils/useApiUrl";

export function useUploadSaveState() {
  const { game } = useGameDetail();
  const { uploadFiles } = useRemoteFiles();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const apiUrl = useApiUrl();

  return useMutation({
    mutationKey: ["save-state", game.id, apiUrl],
    mutationFn: async (args: {
      state: Uint8Array;
      core: Core;
      screenshot: Uint8Array;
      emulatorJS: EmulatorJS;
    }) => {
      const { state, core, screenshot, emulatorJS } = args;
      const slot = Number(emulatorJS.settings?.["save-state-slot"] ?? "1");

      const stateFile: File = {
        content: state,
        stat: {
          path: `states/${core}/${game.id}/${slot}.state`,
          nodeType: FilesystemNodeType.FILE,
        },
      };

      const screenshotFile: File = {
        content: screenshot,
        stat: {
          nodeType: FilesystemNodeType.FILE,
          path: `states/${core}/${game.id}/${slot}.png`,
        },
      };

      return uploadFiles.mutateAsync([stateFile, screenshotFile]).then(() => {
        toast({
          title: `Saved state`,
          description: `Save state has been synced to slot ${slot}`,
        });
      });
    },
    onSuccess: () => {
      queryClient
        .refetchQueries({
          predicate: (query) =>
            query.queryKey.includes("all-save-states") &&
            query.queryKey.includes(game.id),
        })
        .catch(console.error);
    },
    onError: (err) => {
      console.error(err);
      toast({
        title: "Failed to sync save state",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
