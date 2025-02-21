import {
  createRootRoute,
  Navigate,
  Outlet,
  ScrollRestoration,
  useLocation,
} from "@tanstack/react-router";
import { ConfigProvider, useConfigStore } from "../providers/config";
import { RetromClientProvider } from "../providers/retrom-client";
import { QueryClientProvider } from "../providers/query-client";
import { Prompts } from "../components/prompts";
import { Toaster } from "../components/ui/toaster";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { z } from "zod";

const modalsSearchSchema = z.object({
  configModal: z
    .object({
      open: z.boolean().catch(false),
      tab: z.enum(["server", "client"]).catch("server"),
    })
    .optional(),
  updateLibraryModal: z
    .object({
      open: z.boolean().catch(false),
    })
    .optional(),
  cleanLibraryModal: z
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
  serverFileExplorerModal: z
    .object({
      open: z.boolean().catch(false),
      title: z.string().optional().catch(undefined),
      description: z.string().optional().catch(undefined),
    })
    .optional(),
  confirmModal: z
    .object({
      open: z.boolean().catch(false),
      title: z.string().optional().catch(undefined),
      description: z.string().optional().catch(undefined),
    })
    .optional(),
  deletePlatformModal: z
    .object({
      open: z.boolean().catch(false),
      title: z.string().optional().catch(undefined),
      description: z.string().optional().catch(undefined),
      platform: z.object({
        id: z.number(),
        name: z.string(),
        thirdParty: z.boolean(),
      }),
    })
    .optional()
    .catch(undefined),
});

export const Route = createRootRoute({
  validateSearch: zodSearchValidator(modalsSearchSchema),
  component: RootComponent,
  errorComponent: (opts) => <div>Error: {String(opts.error)}</div>,
});

function RootComponent() {
  return (
    <>
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
      <ScrollRestoration />
    </>
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
