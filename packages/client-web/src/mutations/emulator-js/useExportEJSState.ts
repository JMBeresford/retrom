import { toast } from "@retrom/ui/hooks/use-toast";
import { getFileName } from "@/lib/utils";
import { RawMessage } from "@/utils/protos";
import { File } from "@retrom/codegen/retrom/files_pb";
import { useCallback } from "react";

export function useExportEJSState() {
  return useCallback((args: { state: RawMessage<File> }) => {
    const { state } = args;
    const content = new Uint8Array(state.content);

    const stat = state.stat;
    if (!stat) {
      return;
    }

    const blob = new Blob([content], {
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
