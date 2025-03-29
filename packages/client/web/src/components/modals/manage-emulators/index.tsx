import { Route as RootRoute } from "@/routes/__root";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmulators } from "@/queries/useEmulators";
import { usePlatforms } from "@/queries/usePlatforms";
import { Platform } from "@retrom/codegen/retrom/models/platforms";
import {
  Emulator_OperatingSystem,
  NewEmulator,
  SaveStrategy,
  UpdatedEmulator,
} from "@retrom/codegen/retrom/models/emulators";
import { z } from "zod";
import { PlatformMetadata } from "@retrom/codegen/retrom/models/metadata";
import { useNavigate } from "@tanstack/react-router";
import { useLocalEmulatorConfigs } from "@/queries/useLocalEmulatorConfigs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocalConfigs } from "./local-configs";
import { checkIsDesktop } from "@/lib/env";
import { EmulatorList } from "./emulator-list";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type PlatformWithMetadata = Platform & { metadata?: PlatformMetadata };

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
      NewEmulator,
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
          UpdatedEmulator,
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

  return (
    <Dialog
      modal
      open={manageEmulatorsModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            to: ".",
            search: (prev) => ({ ...prev, manageEmulatorsModal: undefined }),
          });
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

        {pending ? (
          <LoaderCircleIcon className="animate-spin h-8 w-8" />
        ) : error ? (
          <p className="text-red-500">
            An error occurred while fetching data. Please try again.
          </p>
        ) : (
          <Tabs defaultValue="emulators">
            <div className="w-full mb-6">
              <TabsList className="flex">
                <TabsTrigger value="emulators" className="basis-1/2">
                  All Emulators
                </TabsTrigger>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-default basis-1/2">
                      <TabsTrigger
                        disabled={!checkIsDesktop()}
                        className="w-full"
                        value="local-configs"
                      >
                        Local Paths
                      </TabsTrigger>
                    </TooltipTrigger>

                    <TooltipContent
                      className={cn(checkIsDesktop() && "hidden")}
                    >
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
        )}
      </DialogContent>
    </Dialog>
  );
}
