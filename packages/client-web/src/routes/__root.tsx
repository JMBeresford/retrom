import { createRootRoute, Outlet } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { ConfigProvider } from "../providers/config";
import { RetromClientProvider } from "../providers/retrom-client";
import { QueryClientProvider } from "../providers/query-client";
import { Prompts } from "../components/prompts";
import { z } from "zod";
import { InputDeviceProvider } from "@/providers/input-device";
import { serverConfigTabSchema } from "@/components/modals/config/server";
import { clientConfigTabSchema } from "@/components/modals/config/client";
import { Toaster } from "@retrom/ui/components/toast";

const modalsSearchSchema = z
  .object({
    configModal: z.object({
      open: z.boolean().default(false),
      tab: z.enum(["server", "client"]).default("server"),
      clientTab: clientConfigTabSchema,
      serverTab: serverConfigTabSchema,
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
    mobileSidebar: z.object({
      open: z.boolean(),
    }),
    mobileMenu: z.object({
      open: z.boolean(),
    }),
    exitModal: z.object({ open: z.boolean() }),
    updatePlatformMetadataModal: z.object({
      open: z.boolean(),
      id: z.number(),
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
            <Outlet />

            <Prompts />
            <Toaster />
            {/* <TanStackRouterDevtools /> */}
          </QueryClientProvider>
        </RetromClientProvider>
      </ConfigProvider>
    </InputDeviceProvider>
  );
}
