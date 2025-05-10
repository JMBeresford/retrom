import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { MenuItem } from "@/components/menubar";
import { useEmulatorJS } from "@/providers/emulator-js";
import { useGameOptions } from "@/providers/emulator-js/game-options";

export const playPause: MenuItem = {
  Render: <PlayPauseRender />,
};

export const restartGame: MenuItem = {
  Render: <RestartGameRender />,
};

function PlayPauseRender() {
  const { setPaused, paused } = useGameOptions();

  return (
    <MenuEntryButton onClick={() => setPaused((prev) => !prev)}>
      {paused ? "Resume Game" : "Pause Game"}
    </MenuEntryButton>
  );
}

function RestartGameRender() {
  const emulatorJS = useEmulatorJS();

  return (
    <MenuEntryButton onClick={() => emulatorJS.gameManager?.restart()}>
      Restart Game
    </MenuEntryButton>
  );
}
