import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useRef } from "react";
import { Scene } from "../components/fullscreen/scene";
import { View } from "@react-three/drei";
import { FullscreenMenubar } from "../components/fullscreen/menubar";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { GroupContextProvider } from "@/providers/fullscreen/group-context";
import { GamepadProvider } from "@/providers/gamepad";
import { navigateByDirection } from "@noriginmedia/norigin-spatial-navigation";
import { useHotkeys } from "@/providers/hotkeys";
import { InputDeviceProvider } from "@/providers/input-device";

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
            className={cn(
              "h-[100dvh] max-h-[100dvh] w-screen relative",
              "grid grid-rows-[auto_1fr]",
            )}
          >
            <div className="absolute inset-0 z-[-1]">
              <Scene eventSource={container}>
                <View.Port />
              </Scene>
            </div>

            <FullscreenMenubar className="w-full border-b z-[50] bg-background" />

            <div className="flex flex-col overflow-hidden w-full *:overflow-y-auto">
              <Outlet />
            </div>
          </div>
        </GroupContextProvider>
      </GamepadProvider>
    </InputDeviceProvider>
  );
}
