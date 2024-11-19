import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useRef } from "react";
import { FullscreenMenubar } from "../components/fullscreen/menubar";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { GroupContextProvider } from "@/providers/fullscreen/group-context";
import { GamepadProvider } from "@/providers/gamepad";
import {
  init,
  navigateByDirection,
  setKeyMap,
} from "@noriginmedia/norigin-spatial-navigation";
import { useHotkeys } from "@/providers/hotkeys";
import { InputDeviceProvider } from "@/providers/input-device";
import { checkIsDesktop } from "@/lib/env";
import { getCurrentWindow } from "@tauri-apps/api/window";

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
  validateSearch: zodSearchValidator(searchSchema),
  loader: async () => {
    if (checkIsDesktop() && !import.meta.env.DEV) {
      await getCurrentWindow().setFullscreen(true);
    }

    init({
      // debug: import.meta.env.DEV,
      shouldUseNativeEvents: true,
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
    <InputDeviceProvider>
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
    </InputDeviceProvider>
  );
}
