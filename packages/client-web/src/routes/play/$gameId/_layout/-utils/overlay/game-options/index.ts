import { playPause, restartGame } from "./gameplay-options";
import { loadStateList, saveStateList } from "./save-states";
import { backups, saveFileInfo, syncToCloud } from "./save-files";
import { OverlayMenuItem } from "..";

export const gameOptions: OverlayMenuItem = {
  label: "Game Options",
  labelSub: "Gameplay and save related options",
  items: [
    { label: "Gameplay Options", groupItems: [playPause, restartGame] },
    { label: "Save States", groupItems: [saveStateList, loadStateList] },
    { label: "Save Files", groupItems: [saveFileInfo, backups, syncToCloud] },
  ],
};
