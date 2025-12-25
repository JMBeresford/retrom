import { Route as RootRoute } from "@/routes/__root";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@retrom/ui/lib/utils";
import { useEmulators } from "@/queries/useEmulators";
import { usePlatforms } from "@/queries/usePlatforms";
import { Platform } from "@retrom/codegen/retrom/models/platforms_pb";
import {
  EmulatorSchema,
  NewEmulatorJson,
  Emulator_OperatingSystem,
  SaveStrategy,
  UpdatedEmulatorJson,
} from "@retrom/codegen/retrom/models/emulators_pb";
import { z } from "zod";
import { PlatformMetadata } from "@retrom/codegen/retrom/models/metadata_pb";
import { useNavigate } from "@tanstack/react-router";
import { useLocalEmulatorConfigs } from "@/queries/useLocalEmulatorConfigs";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@retrom/ui/components/tabs";
import { LocalConfigs } from "./local-configs";

export type PlatformWithMetadata = Platform & { metadata?: PlatformMetadata };

export const saveStrategyDisplayMap: Record<SaveStrategy, string> = {
  [SaveStrategy.SINGLE_FILE]: "Single File",
  [SaveStrategy.FILE_SYSTEM_DIRECTORY]: "File System Directory",
  [SaveStrategy.DISK_IMAGE]: "Disk Image",
};

import { checkIsDesktop } from "@/lib/env";
import { EmulatorList } from "./emulator-list";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@retrom/ui/components/tooltip";

export type EmulatorSchema = z.infer<typeof emulatorSchema>;
export const emulatorSchema = z.object({
  name: z
    .string()
    .min(1, "Emulator name must not be empty")
    .max(128, "Emulator name must not exceed 128 characters"),
  supportedPlatforms: z.array(z.number()),
  saveStrategy: z.nativeEnum(SaveStrategy, {
    message: "Select a save strategy",
  }),
  operatingSystems: z.nativeEnum(Emulator_OperatingSystem).array(),
}) satisfies z.ZodObject<
  Record<
    keyof Omit<
      NewEmulatorJson,
      "createdAt" | "updatedAt" | "builtIn" | "libretroName"
    >,
    z.ZodTypeAny
  >
>;

export type ChangesetSchema = z.infer<typeof changesetSchema>;
export const changesetSchema = z.object({
  emulators: z.record(
    z.string(),
    z.object({
      id: z.number(),
      builtIn: z.boolean().default(false),
      ...emulatorSchema.shape,
    }),
  ),
}) satisfies z.ZodObject<{
  emulators: z.ZodRecord<
    z.ZodString,
    z.ZodObject<
      Record<
        keyof Omit<
          UpdatedEmulatorJson,
          "createdAt" | "updatedAt" | "builtIn" | "libretroName"
        >,
        z.ZodTypeAny
      >
    >
  >;
}>;

export function ManageEmulatorsModal() {
  const navigate = useNavigate();
  const { manageEmulatorsModal } = RootRoute.useSearch();

  return (
    <Dialog
      modal
      open={manageEmulatorsModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          navigate({
            to: ".",
            search: (prev) => ({ ...prev, manageEmulatorsModal: undefined }),
          }).catch(console.error);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Emulators</DialogTitle>
          <DialogDescription className="max-w-[70ch]">
            Manage existing emulator definitions and/or create new ones.
            Configure paths to your local emulators in the Local Paths tab.
          </DialogDescription>
        </DialogHeader>

        <Content />
      </DialogContent>
    </Dialog>
  );
}

function Content() {
  const { data: emulators, status: emulatorsStatus } = useEmulators({
    selectFn: (data) => data.emulators,
  });

  const { data: emulatorConfigs, status: emulatorConfigsStatus } =
    useLocalEmulatorConfigs({ selectFn: (data) => data.configs });

  const { data: platforms, status: platformsStatus } = usePlatforms({
    request: { withMetadata: true },
    selectFn: (data) =>
      data.platforms
        .filter((platform) => !platform.thirdParty)
        .map((p) => ({
          ...p,
          metadata: data.metadata.find((m) => m.platformId === p.id),
        })),
  });

  const pending =
    emulatorsStatus === "pending" ||
    platformsStatus === "pending" ||
    emulatorConfigsStatus === "pending";

  const error =
    emulatorsStatus === "error" ||
    platformsStatus === "error" ||
    emulatorConfigsStatus === "error";

  return pending ? (
    <LoaderCircleIcon className="animate-spin h-8 w-8" />
  ) : error ? (
    <p className="text-red-500">
      An error occurred while fetching data. Please try again.
    </p>
  ) : (
    <Tabs defaultValue="emulators">
      <div className="w-full mb-6">
        <TabsList className="flex w-full">
          <TabsTrigger value="emulators" className="w-full">
            All Emulators
          </TabsTrigger>

          <TooltipProvider>
            <Tooltip>
              <TabsTrigger
                asChild
                disabled={!checkIsDesktop()}
                className="w-full"
                value="local-configs"
              >
                <TooltipTrigger className="disabled:pointer-events-auto">
                  Local Paths
                </TooltipTrigger>
              </TabsTrigger>

              <TooltipContent className={cn(checkIsDesktop() && "hidden")}>
                Only available on desktop
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>
      </div>

      <TabsContent value="emulators" className={cn("h-fit", "")}>
        <EmulatorList platforms={platforms} emulators={emulators} />
      </TabsContent>

      <TabsContent value="local-configs">
        <LocalConfigs emulators={emulators} configs={emulatorConfigs} />
      </TabsContent>
    </Tabs>
  );
}
