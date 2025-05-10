import { toast } from "@/components/ui/use-toast";
import { useEmulatorJS } from "@/providers/emulator-js";
import { useRemoteFiles } from "@/routes/play/$gameId/_layout/-utils/useRemoteFiles";
import { useMutation } from "@tanstack/react-query";

export function useLoadEJSState() {
  const emulatorJS = useEmulatorJS();
  const { downloadFiles } = useRemoteFiles();

  return useMutation({
    mutationFn: async (args: {
      core: string;
      gameId: number;
      slot: number;
    }) => {
      const { core, gameId, slot } = args;

      return downloadFiles.mutateAsync(
        `states/${core}/${gameId}/${slot}.state`,
        {
          onSuccess: (files) => {
            const state = files?.at(0)?.content;
            if (!state) {
              toast({
                title: "Failed to load state",
                description: "State not found",
                variant: "destructive",
              });
            }

            emulatorJS.gameManager?.loadState(state);

            toast({
              title: "State loaded",
              description: "State has been loaded successfully",
            });
          },
          onError: (err) => {
            toast({
              title: "Failed to load state",
              description: err.message,
              variant: "destructive",
            });
          },
        },
      );
    },
  });
}
