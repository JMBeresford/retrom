import { StateInfo } from "@/queries/emulator-js/useEJSSaveState";
import { toast } from "@/components/ui/use-toast";
import { getFileName } from "@/lib/utils";
import { useCallback } from "react";

export function useExportEJSState() {
  return useCallback((args: { stateInfo: StateInfo }) => {
    const { stateInfo } = args;
    const state = stateInfo?.state;
    if (!stateInfo || state === undefined) {
      return;
    }

    const stat = stateInfo.stat;
    const blob = new Blob([state], {
      type: "application/octet-stream",
    });

    const fileName = getFileName(stat.path);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
    URL.revokeObjectURL(url);
    a.remove();

    toast({
      title: "State exported",
      description: "State has been exported successfully",
    });
  }, []);
}
