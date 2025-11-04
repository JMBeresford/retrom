import { Button } from "@retrom/ui/components/button";
import { DialogFooter } from "@retrom/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@retrom/ui/components/form";
import { TabsContent } from "@retrom/ui/components/tabs";
import {
  MetadataConfig_ImageFormat,
  MetadataConfigSchema,
  ServerConfig,
} from "@retrom/codegen/retrom/server/config_pb";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
  InfoIcon,
  Loader2Icon,
  LoaderCircleIcon,
  Sparkles,
  Trash2Icon,
} from "lucide-react";
import { useCallback } from "react";
import { useForm } from "@retrom/ui/components/form";
import { z } from "zod";
import { create } from "@bufbuild/protobuf";
import { Checkbox } from "@retrom/ui/components/checkbox";
import { cn } from "@retrom/ui/lib/utils";
import { useServerLocalMetadataStatus } from "@/queries/useServerLocalMetadataStatus";
import { useDeleteServerLocalMetadata } from "@/mutations/useDeleteServerLocalMetadata";
import { getBestFileSizeOrder, readableByteSize } from "@/utils/files";
import { Input } from "@retrom/ui/components/input";
import { Toggle } from "@retrom/ui/components/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@retrom/ui/components/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@retrom/ui/components/select";

const metadataSchema = z.object({
  storeMetadataLocally: z.boolean().default(false),
  optimization: z
    .object({
      jpegQuality: z.coerce.number().min(1).max(100).default(85),
      jpegOptimization: z.boolean(),

      pngOptimization: z.boolean(),
      pngQuality: z.coerce.number().min(1).max(100).catch(85),
      pngOptimizationLevel: z.coerce.number().min(0).max(6).catch(2),

      webpQuality: z.coerce.number().min(1).max(100).catch(85),
      webpLossless: z.boolean(),

      preferredImageFormat: z
        .nativeEnum(MetadataConfig_ImageFormat)
        .catch(MetadataConfig_ImageFormat.JPEG),
    })
    .default({
      jpegQuality: 85,
      jpegOptimization: false,
      pngOptimization: true,
      pngQuality: 85,
      pngOptimizationLevel: 2,
      webpQuality: 85,
      webpLossless: true,
      preferredImageFormat: MetadataConfig_ImageFormat.JPEG,
    }),
});

export function MetadataConfig(props: {
  currentConfig: NonNullable<ServerConfig>;
}) {
  const navigate = useNavigate();
  const { mutate: update, status } = useUpdateServerConfig();

  const form = useForm<z.infer<typeof metadataSchema>>({
    resolver: zodResolver(metadataSchema),
    defaultValues: metadataSchema.parse(
      create(MetadataConfigSchema, props.currentConfig.metadata),
    ),
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof metadataSchema>) => {
      try {
        update({
          config: {
            ...props.currentConfig,
            metadata: create(MetadataConfigSchema, values),
          },
        });

        form.reset(values);
      } catch (error) {
        console.error(error);
        form.reset();
      }
    },
    [form, props.currentConfig, update],
  );

  const dirty = form.formState.isDirty;
  const canSubmit = dirty && status !== "pending";

  return (
    <TooltipProvider>
      <TabsContent value="metadata" className="mt-6 flex flex-col gap-6">
        <LocalMetadataStatus />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="storeMetadataLocally"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-top gap-2">
                      <Checkbox
                        disabled={status === "pending"}
                        id="server-local-metadata-enabled"
                        checked={field.value}
                        onCheckedChange={(val) => {
                          field.onChange(val);
                        }}
                      />
                      <div className={cn("grid gap-1 leading-none")}>
                        <label htmlFor="server-local-metadata-enabled">
                          Enable Local Metadata Storage
                        </label>

                        <p className="text-sm text-muted-foreground">
                          Fetch and store external metadata locally on the
                          Retrom server.
                        </p>
                      </div>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="optimization.jpegQuality"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>JPEG Quality</FormLabel>
                  <div className="flex items-center gap-4">
                    <FormControl>
                      <Input type="range" min={1} max={100} {...field} />
                    </FormControl>
                    <p className="text-sm font-semibold">{field.value}</p>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              disabled
              name="optimization.webpQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    WebP Quality <em className="text-sm">(coming soon)</em>
                  </FormLabel>
                  <div className="flex items-center gap-4">
                    <FormControl>
                      <Input type="range" min={1} max={100} {...field} />
                    </FormControl>
                    <p className="text-sm font-semibold">{field.value}</p>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              disabled
              name="optimization.pngQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    PNG Quality <em className="text-sm">(coming soon)</em>
                  </FormLabel>
                  <div className="flex items-center gap-4">
                    <FormControl>
                      <Input type="range" min={1} max={100} {...field} />
                    </FormControl>
                    <p className="text-sm font-semibold">{field.value}</p>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              disabled
              name="optimization.pngOptimizationLevel"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
                    <FormLabel>
                      PNG Optimization Level{" "}
                      <em className="text-sm">(coming soon)</em>
                    </FormLabel>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon size={"1rem"} className="text-primary" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        Lower levels are faster but less effective, while higher
                        levels take more time but yield better compression.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-4">
                    <FormControl>
                      <Input type="range" min={0} max={6} {...field} />
                    </FormControl>
                    <p className="text-sm font-semibold">{field.value}</p>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1">
                <FormLabel>Lossless/Lossy Compression</FormLabel>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon size={"1rem"} className="text-primary" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    Choose between lossless and lossy compression for each image
                    format. Lossless compression retains all original image
                    data, while lossy compression reduces file size by removing
                    some data.
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="grid grid-cols-3 place-items-center bg-muted py-4">
                <FormField
                  control={form.control}
                  name="optimization.jpegOptimization"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-center gap-2">
                      <p className="text-center">JPEG</p>
                      <FormControl>
                        <Toggle
                          disabled={field.disabled}
                          variant="outline"
                          size="sm"
                          pressed={field.value}
                          onPressedChange={field.onChange}
                        >
                          <Sparkles />
                          {field.value ? "Lossless" : "Lossy"}
                        </Toggle>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  disabled
                  name="optimization.pngOptimization"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-center gap-2">
                      <p className="text-center">
                        PNG <em className="text-xs">(coming soon)</em>
                      </p>
                      <FormControl>
                        <Toggle
                          disabled={field.disabled}
                          variant="outline"
                          size="sm"
                          pressed={field.value}
                          onPressedChange={field.onChange}
                        >
                          <Sparkles />
                          {field.value ? "Lossless" : "Lossy"}
                        </Toggle>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  disabled
                  name="optimization.webpLossless"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-center gap-2">
                      <p className="text-center">
                        WEBP <em className="text-xs">(coming soon)</em>
                      </p>
                      <FormControl>
                        <Toggle
                          disabled={field.disabled}
                          variant="outline"
                          size="sm"
                          pressed={field.value}
                          onPressedChange={field.onChange}
                        >
                          <Sparkles />
                          {field.value ? "Lossless" : "Lossy"}
                        </Toggle>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              disabled
              name="optimization.preferredImageFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Preferred Image Format{" "}
                    <em className="text-sm">(coming soon)</em>
                  </FormLabel>
                  <FormControl>
                    <Select
                      disabled={field.disabled}
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a format..." />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem
                          value={MetadataConfig_ImageFormat.UNSPECIFIED.toString()}
                        >
                          None
                        </SelectItem>

                        <SelectItem
                          value={MetadataConfig_ImageFormat.JPEG.toString()}
                        >
                          JPEG
                        </SelectItem>

                        <SelectItem
                          value={MetadataConfig_ImageFormat.PNG.toString()}
                        >
                          PNG
                        </SelectItem>

                        <SelectItem
                          value={MetadataConfig_ImageFormat.WEBP.toString()}
                        >
                          WEBP
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                onClick={() =>
                  navigate({
                    to: ".",
                    search: (prev) => ({ ...prev, configModal: undefined }),
                  }).catch(console.error)
                }
                variant="secondary"
              >
                Close
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {status === "pending" ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </TabsContent>
    </TooltipProvider>
  );
}

function LocalMetadataStatus() {
  const { data, status } = useServerLocalMetadataStatus();
  const { mutate, status: deleteStatus } = useDeleteServerLocalMetadata();

  const pending = status === "pending" || deleteStatus === "pending";
  const totalByteSize = BigInt(data?.totalByteSize ?? 0);

  return (
    <div className="flex items-center gap-4">
      <Button
        disabled={pending}
        onClick={() => mutate({})}
        size="sm"
        variant="secondary"
        className="gap-2"
      >
        <Trash2Icon size={16} /> Clear Local Metadata
      </Button>

      {pending ? (
        <Loader2Icon className="animate-spin inline-block" />
      ) : (
        <p className="text-sm italic text-muted-foreground">
          <span>{data?.totalFiles ?? 0}</span>
          <span> items using</span>
          <span>
            {" "}
            {readableByteSize(
              totalByteSize,
              getBestFileSizeOrder(totalByteSize / 10n),
            )}
          </span>
        </p>
      )}
    </div>
  );
}
