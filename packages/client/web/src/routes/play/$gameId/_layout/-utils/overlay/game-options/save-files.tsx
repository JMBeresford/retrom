import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { MenuItem } from "@/components/menubar";
import { useEJSSessionState } from "@/providers/emulator-js/ejs-session";

export const syncToCloud: MenuItem = {
  Render: <SyncToCloudRender />,
};

function SyncToCloudRender() {
  const { saveSaveFile } = useEJSSessionState();

  return (
    <MenuEntryButton onClick={saveSaveFile}>Sync Save to Cloud</MenuEntryButton>
  );
}
