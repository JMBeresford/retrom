import { SetupModal } from "@/components/modals/setup";
import { UpdateLibraryModal } from "@/components/modals/update-library";
import { SideBar } from "@/components/side-bar";
import { FilterAndSortContext } from "@/components/side-bar/filter-sort-context";
import { Menubar } from "@/components/menubar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@retrom/ui/components/resizable";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
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
import { saveWindowState, StateFlags } from "@tauri-apps/plugin-window-state";
import { useEffect } from "react";
import { useConfig } from "@/providers/config";
import { ServerFileExplorerModal } from "@/components/modals/server-file-explorer";
import { ModalActionProvider } from "@/providers/modal-action";
import { ConfirmModal } from "@/components/modals/confirm";
import { DeletePlatformModal } from "@/components/modals/delete-platform";
import { CleanLibraryModal } from "@/components/modals/clean-library";
import { UpdatePlatformMetadataModal } from "@/components/modals/update-platform-metadata";
import { cn } from "@retrom/ui/lib/utils";
import { ExitModal } from "@/components/modals/exit";
import { InstallationIndicator } from "@/components/menubar/installation-indicator";

export const Route = createFileRoute("/(windowed)/_layout")({
  component: LayoutComponent,
  loader: async () => {
    destroy();
    if (checkIsDesktop()) {
      await getCurrentWindow().setFullscreen(false);
    }
  },
});

function LayoutComponent() {
  const setupComplete = useConfig(
    (store) => store.flowCompletions?.setupComplete,
  );

  useEffect(() => {
    function onResize() {
      if (checkIsDesktop()) {
        void saveWindowState(StateFlags.ALL);
      }
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      {(!checkIsDesktop() || setupComplete) && (
        <ModalActionProvider>
          <div className="h-[100dvh] max-h-[100dvh] w-screen max-w-[100dvw] relative flex flex-col">
            <Menubar />
            <ResizablePanelGroup
              direction="horizontal"
              className="relative h-full w-full"
            >
              <MobileSidebar />

              <ResizablePanel
                id="desktop-sidebar"
                defaultSize={25}
                maxSize={50}
                className="bg-muted hidden sm:flex"
              >
                <FilterAndSortContext>
                  <SideBar />
                </FilterAndSortContext>
              </ResizablePanel>

              <ResizableHandle className="hidden sm:flex" />

              <ResizablePanel id="main-content" defaultSize={75}>
                <ScrollArea className="h-full max-h-full w-full max-w-full">
                  <main className="sm:px-5 pt-5 pb-16">
                    <Outlet />
                  </main>
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
            <div className="border-t flex items-center justify-center">
              <InstallationIndicator />
            </div>
          </div>

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
          <ConfirmModal />
          <ServerFileExplorerModal />
          <DeletePlatformModal />
          <CleanLibraryModal />
          <UpdatePlatformMetadataModal />
          <ExitModal />
        </ModalActionProvider>
      )}

      <SetupModal />
    </>
  );
}

function MobileSidebar() {
  const { mobileSidebar } = Route.useSearch();

  return (
    <div
      className={cn(
        "sm:hidden absolute inset-0 border-r bg-background z-40",
        "slide-in-from-left slide-out-to-left",
        "transition-all duration-300 ease-in-out fill-mode-both",
        mobileSidebar?.open ? "animate-in" : "animate-out",
      )}
    >
      <FilterAndSortContext>
        <SideBar />
      </FilterAndSortContext>
    </div>
  );
}
