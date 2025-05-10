import { MenuItem } from "@/components/menubar";
import { playPause, restartGame } from "./gameplay-options";
import { loadStateList, saveStateList } from "./save-states";
import { syncToCloud } from "./save-files";

export const gameOptions: MenuItem = {
  label: "Game Options",
  items: [
    { label: "Gameplay Options", groupItems: [playPause, restartGame] },
    { label: "Save States", groupItems: [saveStateList, loadStateList] },
    { label: "Save Files", groupItems: [syncToCloud] },
  ],
};
