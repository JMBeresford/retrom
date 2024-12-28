import { SetupModal } from "@/components/modals/setup";
import { UpdateLibraryModal } from "@/components/modals/update-library";
import { SideBar } from "@/components/side-bar";
import { FilterAndSortContext } from "@/components/side-bar/filter-sort-context";
import { Menubar } from "@/components/menubar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CheckForUpdateModal } from "@/components/modals/check-for-update";
import { DefaultProfilesModal } from "@/components/modals/default-profiles";
import { DeleteLibraryModal } from "@/components/modals/delete-library";
import { DownloadMetadataModal } from "@/components/modals/download-metadata";
import { ManageEmulatorProfilesModal } from "@/components/modals/manage-profiles";
import { ManageEmulatorsModal } from "@/components/modals/manage-emulators";
import { MatchPlatformsModal } from "@/components/modals/match-platforms";
import { VersionInfoModal } from "@/components/modals/version-info";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { checkIsDesktop } from "@/lib/env";
import { destroy } from "@noriginmedia/norigin-spatial-navigation";
import { ConfigModal } from "@/components/modals/config";
import {
  restoreStateCurrent,
  saveWindowState,
  StateFlags,
} from "@tauri-apps/plugin-window-state";
import { useEffect } from "react";

export const Route = createFileRoute("/(windowed)/_layout")({
  component: LayoutComponent,
  loader: async () => {
    destroy();
    if (checkIsDesktop()) {
      await getCurrentWindow().setFullscreen(false);

      await restoreStateCurrent(StateFlags.ALL);
    }
  },
});

function LayoutComponent() {
  useEffect(() => {
    async function onResize() {
      saveWindowState(StateFlags.ALL);
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <div className="h-screen max-h-screen w-screen max-w-screen relative flex flex-col">
        <Menubar />
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={25} maxSize={40} className="bg-muted">
            <div className="w-full h-full @container/sidebar">
              <FilterAndSortContext>
                <SideBar />
              </FilterAndSortContext>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={75}>
            <ScrollArea className="h-full max-h-full w-full max-w-full">
              <main className="p-5 pb-16">
                <Outlet />
              </main>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <SetupModal />
      <UpdateLibraryModal />
      <DownloadMetadataModal />
      <DeleteLibraryModal />
      <MatchPlatformsModal />
      <DefaultProfilesModal />
      <ManageEmulatorsModal />
      <ManageEmulatorProfilesModal />
      <CheckForUpdateModal />
      <VersionInfoModal />
      <ConfigModal />
    </>
  );
}
