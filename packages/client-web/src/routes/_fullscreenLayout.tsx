import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useRef } from "react";
import { FullscreenMenubar } from "../components/fullscreen/menubar";
import { cn } from "@retrom/ui/lib/utils";
import { z } from "zod";
import { GroupContextProvider } from "@/providers/fullscreen/group-context";
import { GamepadProvider } from "@/providers/gamepad";
import {
  init,
  navigateByDirection,
  setKeyMap,
} from "@noriginmedia/norigin-spatial-navigation";
import { useHotkeys } from "@/providers/hotkeys";
import { checkIsDesktop } from "@/lib/env";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { zodValidator } from "@tanstack/zod-adapter";
import { FocusedHotkeyLayerProvider } from "@/providers/hotkeys/layers";
import { configStore } from "@/providers/config";

declare global {
  export interface HotkeyZones {
    "root-navigation": boolean;
  }
}

const searchSchema = z.object({
  activeGroupId: z.number().catch(-1),
});

export const Route = createFileRoute("/_fullscreenLayout")({
  component: FullscreenLayout,
  validateSearch: zodValidator(searchSchema),
  loader: async () => {
    const { windowedFullscreenMode } =
      configStore.getState()?.config?.interface?.fullscreenConfig ?? {};

    /**
     * On desktop, default to fullscreen window mode unless configured otherwise.
     * On web, default to windowed mode unless explicitly set to fullscreen.
     */
    if (checkIsDesktop() && windowedFullscreenMode !== true) {
      await getCurrentWindow().setFullscreen(true);
    } else if (!checkIsDesktop() && windowedFullscreenMode === false) {
      console.log("window", { window });
      await window.document.documentElement.requestFullscreen();
    }

    init({
      // debug: import.meta.env.DEV,
      shouldUseNativeEvents: true,
      distanceCalculationMethod: "center",
      useGetBoundingClientRect: true,
      // visualDebug: true,
    });

    // ununsed, setting to invalid keycode to keep vanilla arrow key behavior
    setKeyMap({
      up: 1000,
      down: 1000,
      left: 1000,
      right: 1000,
      enter: 1000,
    });
  },
});

function FullscreenLayout() {
  const container = useRef<HTMLDivElement>(null!);

  useHotkeys({
    handlers: {
      UP: {
        handler: () => navigateByDirection("up", {}),
        zone: "root-navigation",
      },
      DOWN: {
        handler: () => navigateByDirection("down", {}),
        zone: "root-navigation",
      },
      LEFT: {
        handler: () => navigateByDirection("left", {}),
        zone: "root-navigation",
      },
      RIGHT: {
        handler: () => navigateByDirection("right", {}),
        zone: "root-navigation",
      },
    },
  });

  return (
    <FocusedHotkeyLayerProvider>
      <GamepadProvider>
        <GroupContextProvider>
          <div
            ref={container}
            className={cn("h-[100dvh] w-screen relative", "flex flex-col")}
          >
            <FullscreenMenubar className="w-full border-b z-[50] bg-background" />

            <div className="flex flex-col h-full max-h-full overflow-hidden w-full *:overflow-y-auto">
              <Outlet />
            </div>
          </div>
        </GroupContextProvider>
      </GamepadProvider>
    </FocusedHotkeyLayerProvider>
  );
}
