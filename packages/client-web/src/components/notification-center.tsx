import { useToastHistory, Toast } from "@retrom/ui/components/toast";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@retrom/ui/components/popover";
import { Bell, X } from "lucide-react";
import { cn } from "@retrom/ui/lib/utils";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import { Button } from "@retrom/ui/components/button";

export function NotificationCenter() {
  const { history: toasts, clearHistory } = useToastHistory();

  return (
    <Popover>
      <PopoverTrigger
        disabled={toasts.length <= 0}
        className={cn(
          "relative disabled:pointer-events-none disabled:touch-none disabled:opacity-50",
        )}
      >
        <Bell
          className={cn(
            "stroke-0",
            "transition-all",
            "fill-muted-foreground",
            "hover:fill-foreground",
          )}
        />

        {toasts.length ? (
          <span
            className={cn(
              "text-[10px] bg-accent absolute top-0 -right-1/3",
              "w-4.5 h-4.5 rounded-full grid place-items-center",
            )}
          >
            {toasts.length}
          </span>
        ) : (
          <></>
        )}
      </PopoverTrigger>

      <PopoverContent
        side="top"
        sideOffset={15}
        align="end"
        className={cn(
          "relative flex flex-col gap-2 max-h-[60vh] overflow-hidden p-4",
        )}
      >
        <PopoverClose className="absolute top-3 right-3">
          <X size={14} />
        </PopoverClose>
        <div className="flex flex-col">
          <h3 className="text-lg">Notification Center</h3>
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {toasts.length} notification{toasts.length !== 1 ? "s" : ""}
            </p>

            <PopoverClose asChild>
              <Button
                onClick={clearHistory}
                variant="inline"
                className="p-0 h-min underline"
              >
                clear all
              </Button>
            </PopoverClose>
          </div>
        </div>

        <ScrollArea
          className={cn("flex flex-col", "bg-muted rounded-sm px-2 pb-2")}
        >
          <div className={cn("flex flex-col toaster group/toaster")}>
            {toasts.slice(0, 10).map((toast) => (
              <span
                key={toast.id}
                className="pb-2 not-last:border-b border-border rounded-none"
              >
                <Toast
                  description="No description"
                  {...toast}
                  className={cn(
                    "group/toast relative p-0 bg-transparent border-0 pt-2",
                  )}
                  closeButton
                  dismissible
                />
              </span>
            ))}
          </div>
          {toasts.length > 10 ? (
            <p className="text-sm text-muted-foreground/65 italic text-center pt-3 border-t">
              and {toasts.length - 10} more...
            </p>
          ) : (
            <></>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
