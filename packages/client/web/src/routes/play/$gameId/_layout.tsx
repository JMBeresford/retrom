import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GameDetailProvider } from "@/providers/game-details";
import { ModalActionProvider } from "@/providers/modal-action";
import { ConfirmModal } from "@/components/modals/confirm";
import {
  init,
  navigateByDirection,
  setKeyMap,
} from "@noriginmedia/norigin-spatial-navigation";
import { useHotkeys } from "@/providers/hotkeys";
import { GamepadProvider } from "@/providers/gamepad";

export const Route = createFileRoute("/play/$gameId/_layout")({
  component: Layout,
  loader: () => {
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

function Layout() {
  const { gameId } = Route.useParams();

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
    <GamepadProvider>
      <ModalActionProvider>
        <GameDetailProvider gameId={parseInt(gameId)}>
          <div className="w-dvw h-dvh overflow-hidden flex flex-col">
            <Outlet />
          </div>
        </GameDetailProvider>

        <ConfirmModal />
      </ModalActionProvider>
    </GamepadProvider>
  );
}
