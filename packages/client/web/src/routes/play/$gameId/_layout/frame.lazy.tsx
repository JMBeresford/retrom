import { FocusContainer } from "@/components/fullscreen/focus-container";
import { HotkeyButton } from "@/components/fullscreen/hotkey-button";
import { cn } from "@/lib/utils";
import { EmulatorJSProvider } from "@/providers/emulator-js";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Route as ParentRoute } from ".";
import { Overlay } from "./-utils/overlay";
import "./play.scss";

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
          "fixed top-0 left-0",
          "bg-background border-r border-b rounded-br",
          "transition-transform",
          showMenuBtn ? "translate-x-0" : "-translate-x-full delay-200",
        )}
      >
        <Link    to="." search={(prev) => ({ ...prev, overlay: true })}>
          <HotkeyButton hotkey="MENU">Menu</HotkeyButton>
        </Link>
      </div>
    </div>
  );
}
