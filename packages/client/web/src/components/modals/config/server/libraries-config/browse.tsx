import { Button } from "@/components/ui/button";
import { FormControl, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useModalAction } from "@/providers/modal-action";
import { FolderOpen } from "lucide-react";
import { useCallback } from "react";
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";

export function BrowseButton<T extends FieldValues>(props: {
  field: ControllerRenderProps<T>;
  fieldState: ControllerFieldState;
}) {
  const { openModal } = useModalAction("serverFileExplorerModal");
  const { field, fieldState } = props;

  const browse = useCallback(
    (setValueCallback: (path: string) => void) => {
      openModal({
        title: "Select Library Path",
        description: "Select a directory for this library.",
        onClose: (path) => {
          if (path) {
            setValueCallback(path);
          }
        },
      });
    },
    [openModal],
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <FormItem className="flex items-center gap-2 h-min space-y-0 py-1 relative">
          <Button
            {...field}
            size="icon"
            type="button"
            className="min-h-0 h-min w-min p-2"
            onClick={() => browse(field.onChange)}
          >
            <FolderOpen className="h-[1rem] w-[1rem]" />
          </Button>

          <TooltipTrigger asChild>
            <FormControl>
              <Input
                {...field}
                placeholder="Select a directory..."
                className={cn(
                  "text-xs text-muted-foreground transition-colors w-[350px] overflow-hidden overflow-ellipsis",
                  "border-none font-mono placeholder:italic bg-transparent",
                  fieldState.isDirty && "text-foreground",
                )}
              />
            </FormControl>
          </TooltipTrigger>
          <TooltipContent hidden={!field.value}>{field.value}</TooltipContent>
        </FormItem>
      </Tooltip>
    </TooltipProvider>
  );
}
