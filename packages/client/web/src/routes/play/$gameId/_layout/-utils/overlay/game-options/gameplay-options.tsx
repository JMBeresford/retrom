import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { MenuItem } from "@/components/menubar";
import { useGameOptions } from "@/providers/emulator-js/game-options";
import { useNavigate } from "@tanstack/react-router";

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
  const { restartGame } = useGameOptions();
  const navigate = useNavigate();

  return (
    <MenuEntryButton
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        restartGame();
        navigate({
          to: ".",
          search: (prev) => ({ ...prev, overlay: undefined }),
        }).catch(console.error);
      }}
    >
      Restart Game
    </MenuEntryButton>
  );
}
