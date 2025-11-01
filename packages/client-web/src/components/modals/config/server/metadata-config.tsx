import { Button } from "@retrom/ui/components/button";
import { DialogFooter } from "@retrom/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@retrom/ui/components/form";
import { TabsContent } from "@retrom/ui/components/tabs";
import {
  MetadataConfigSchema,
  ServerConfig,
} from "@retrom/codegen/retrom/server/config_pb";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Loader2Icon, LoaderCircleIcon, Trash2Icon } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "@retrom/ui/components/form";
import { z } from "zod";
import { RawMessage } from "@/utils/protos";
import { create } from "@bufbuild/protobuf";
import { Checkbox } from "@retrom/ui/components/checkbox";
import { cn } from "@retrom/ui/lib/utils";
import { useServerLocalMetadataStatus } from "@/queries/useServerLocalMetadataStatus";
import { useDeleteServerLocalMetadata } from "@/mutations/useDeleteServerLocalMetadata";
import { getBestFileSizeOrder, readableByteSize } from "@/utils/files";

type MetadataConfigShape = Record<
  keyof NonNullable<RawMessage<ServerConfig["metadata"]>>,
  z.ZodTypeAny
>;

const metadataSchema = z.object({
  storeMetadataLocally: z.boolean().default(false),
}) satisfies z.ZodObject<MetadataConfigShape>;

export function MetadataConfig(props: {
  currentConfig: NonNullable<ServerConfig>;
}) {
  const navigate = useNavigate();
  const { mutate: update, status } = useUpdateServerConfig();

  const form = useForm<z.infer<typeof metadataSchema>>({
    resolver: zodResolver(metadataSchema),
    defaultValues: create(MetadataConfigSchema, props.currentConfig.metadata),
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
    <TabsContent value="metadata" className="mt-6 flex flex-col gap-4">
      <LocalMetadataStatus />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4"
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
                    <div className={cn("grid gap-1 5 leading-none")}>
                      <label htmlFor="server-local-metadata-enabled">
                        Enable Local Metadata Storage
                      </label>

                      <p className="text-sm text-muted-foreground">
                        Fetch and store external metadata locally on the Retrom
                        server.
                      </p>
                    </div>
                  </div>
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
              getBestFileSizeOrder(totalByteSize / 100n),
            )}
          </span>
        </p>
      )}
    </div>
  );
}
