import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ConfigProvider } from "../providers/config";
import { RetromClientProvider } from "../providers/retrom-client";
import { QueryClientProvider } from "../providers/query-client";
import { Menubar } from "../components/menubar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import { ScrollArea } from "../components/ui/scroll-area";
import { Prompts } from "../components/prompts";
import { Toaster } from "../components/ui/toaster";
import { SideBar } from "@/components/side-bar";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { z } from "zod";
import { SetupModal } from "@/components/modals/setup";
import { UpdateLibraryModal } from "@/components/modals/update-library";
import { DownloadMetadataModal } from "@/components/modals/download-metadata";
import { DeleteLibraryModal } from "@/components/modals/delete-library";
import { MatchPlatformsModal } from "@/components/modals/match-platforms";
import { DefaultProfilesModal } from "@/components/modals/default-profiles";
import { ManageEmulatorProfilesModal } from "@/components/modals/manage-profiles";
import { ManageEmulatorsModal } from "@/components/modals/manage-emulators";
import { FilterAndSortContext } from "@/components/side-bar/filter-sort-context";
import { CheckForUpdateModal } from "@/components/modals/check-for-update";
import { VersionInfoModal } from "@/components/modals/version-info";

const modalsSearchSchema = z.object({
  updateLibraryModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  matchPlatformsModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  defaultProfilesModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  downloadMetadataModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  deleteLibraryModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  manageEmulatorsModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  manageEmulatorProfilesModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  setupModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  checkForUpdateModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  versionInfoModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
});

export const Route = createRootRoute({
  validateSearch: zodSearchValidator(modalsSearchSchema),
  component: () => (
    <>
      <ConfigProvider>
        <RetromClientProvider>
          <QueryClientProvider>
            <div className="h-screen max-h-screen w-screen max-w-screen relative flex flex-col">
              <Menubar />
              <ResizablePanelGroup
                direction="horizontal"
                className="h-full w-full"
              >
                <ResizablePanel
                  defaultSize={25}
                  maxSize={40}
                  className="bg-muted"
                >
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

            <Prompts />

            <Toaster />
          </QueryClientProvider>
        </RetromClientProvider>
      </ConfigProvider>
    </>
  ),
  errorComponent: (opts) => <div>Error: {JSON.stringify(opts.error)}</div>,
});
