import { FocusContainer } from "@/components/fullscreen/focus-container";
import { HotkeyButton } from "@/components/fullscreen/hotkey-button";
import { cn } from "@/lib/utils";
import { EmulatorJSProvider } from "@/providers/emulator-js";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState } from "react";
import { Route as ParentRoute } from ".";
import { Overlay } from "./-utils/overlay";
import "./play.scss";
import { ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export type EmuJsFrameEvent =
  | "exit"
  | "exit-requested"
  | "save-sync-requested"
  | "save-synced"
  | "states-sync-requested"
  | "states-synced";

export const Route = createLazyFileRoute("/play/$gameId/_layout/frame")({
  component: () => <FrameComponent />,
  errorComponent: () => {
    emitFromFrame("exit");
    return <></>;
  },
});

export function emitFromFrame(event: EmuJsFrameEvent) {
  window.parent.postMessage(event);
}

function FrameComponent() {
  const { overlay } = ParentRoute.useSearch();
  const [showMenuBtn, setShowMenuBtn] = useState(false);
  const pointerMoveTimeout = useRef<number>();

  useLayoutEffect(() => {
    const { dismiss } = toast({
      title: "Disclaimer",
      variant: "warning",
      id: "emulatorjs-disclaimer",
      duration: 5000,
      description:
        "In-browser emulation is experimental, please report any issues you encounter.",
      action: (
        <a
          href="https://github.com/JMBeresford/retrom/issues/new/choose"
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="ghost" className="border">
            Report
          </Button>
        </a>
      ),
    });

    return () => {
      dismiss();
    };
  }, []);

  return (
    <div
      className="w-screen h-screen relative"
      onPointerMoveCapture={() => {
        if (overlay) {
          return;
        }

        setShowMenuBtn(true);
        window.clearTimeout(pointerMoveTimeout.current);
        pointerMoveTimeout.current = window.setTimeout(() => {
          if (overlay) {
            return;
          }
          setShowMenuBtn(false);
        }, 2000);
      }}
      onContextMenuCapture={(e) => {
        e.stopPropagation();
      }}
    >
      <FocusContainer
        className="w-full h-full"
        opts={{ focusKey: "frame-focus-root" }}
      >
        <EmulatorJSProvider>
          <Overlay />
        </EmulatorJSProvider>

        <div id="game" className={cn("grid place-items-center")}></div>
      </FocusContainer>

      <div
        className={cn(
          "hidden sm:block fixed top-0 left-0",
          "bg-background border-r border-b rounded-br",
          "transition-transform",
          showMenuBtn ? "translate-x-0" : "-translate-x-full delay-200",
        )}
      >
        <Link to="." search={(prev) => ({ ...prev, overlay: true })}>
          <HotkeyButton hotkey="MENU">Menu</HotkeyButton>
        </Link>
      </div>

      <MobileMenuButton />
    </div>
  );
}

function MobileMenuButton() {
  return (
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Link
            className="fixed top-2 sm:hidden py-1 rounded-r-sm bg-background"
            to="."
            search={(prev) => ({ ...prev, overlay: true })}
          >
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        </TooltipTrigger>

        <TooltipContent
          className={cn(
            "animate-out fill-mode-both fade-out duration-1000 delay-3000",
            "data-[state=open]:animate-out",
            "h-fit py-1 px-2 border-0",
          )}
          side="right"
        >
          <TooltipArrow />
          <div className="animate-pulse">Open the menu</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
