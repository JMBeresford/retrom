import {
  createRootRoute,
  Navigate,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { ConfigProvider, useConfigStore } from "../providers/config";
import { RetromClientProvider } from "../providers/retrom-client";
import { QueryClientProvider } from "../providers/query-client";
import { Prompts } from "../components/prompts";
import { Toaster } from "../components/ui/toaster";
import { z } from "zod";
import { InputDeviceProvider } from "@/providers/input-device";

const modalsSearchSchema = z
  .object({
    configModal: z.object({
      open: z.boolean().default(false),
      tab: z.enum(["server", "client"]).default("server"),
    }),
    updateLibraryModal: z.object({
      open: z.boolean().default(false),
    }),
    cleanLibraryModal: z.object({
      open: z.boolean().default(false),
    }),
    matchPlatformsModal: z.object({
      open: z.boolean().default(false),
    }),
    defaultProfilesModal: z.object({
      open: z.boolean().default(false),
    }),
    downloadMetadataModal: z.object({
      open: z.boolean().default(false),
    }),
    deleteLibraryModal: z.object({
      open: z.boolean().default(false),
    }),
    manageEmulatorsModal: z.object({
      open: z.boolean().default(false),
    }),
    manageEmulatorProfilesModal: z.object({
      open: z.boolean().default(false),
    }),
    setupModal: z.object({
      open: z.boolean().default(false),
    }),
    checkForUpdateModal: z.object({
      open: z.boolean().default(false),
    }),
    versionInfoModal: z.object({
      open: z.boolean().default(false),
    }),
    serverFileExplorerModal: z.object({
      open: z.boolean().default(false),
      title: z.string().optional(),
      description: z.string().optional(),
    }),
    confirmModal: z.object({
      open: z.boolean().default(false),
      title: z.string().optional(),
      description: z.string().optional(),
    }),
    deletePlatformModal: z.object({
      open: z.boolean().default(false),
      title: z.string().optional(),
      description: z.string().optional(),
      platform: z.object({
        id: z.number(),
        name: z.string(),
        thirdParty: z.boolean(),
      }),
    }),
    updatePlatformMetadataModal: z.object({
      open: z.boolean(),
      id: z.number(),
    }),
    mobileSidebar: z.object({
      open: z.boolean(),
    }),
    mobileMenu: z.object({
      open: z.boolean(),
    }),
  })
  .partial();

export const Route = createRootRoute({
  validateSearch: zodValidator(modalsSearchSchema),
  component: RootComponent,
  errorComponent: (opts) => <div>Error: {String(opts.error)}</div>,
});

function RootComponent() {
  return (
    <InputDeviceProvider>
      <ConfigProvider>
        <RetromClientProvider>
          <QueryClientProvider>
            <HandleLayoutRedirect />
            <Outlet />

            <Prompts />
            <Toaster />
          </QueryClientProvider>
        </RetromClientProvider>
      </ConfigProvider>
    </InputDeviceProvider>
  );
}

function HandleLayoutRedirect() {
  const path = useLocation().pathname;
  const fullscreenByDefault =
    useConfigStore().getState().config?.interface?.fullscreenByDefault;

  if (path !== "/") {
    return <></>;
  }

  return (
    <>
      {fullscreenByDefault ? (
        <Navigate to="/fullscreen" replace={true} />
      ) : (
        <Navigate to="/home" replace={true} />
      )}

      <Outlet />
    </>
  );
}
