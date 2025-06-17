import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import {
  SavesConfigSchema,
  ServerConfig,
} from "@retrom/codegen/retrom/server/config_pb";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RawMessage } from "@/utils/protos";
import { create } from "@bufbuild/protobuf";

type SavesConfigShape = Record<
  keyof NonNullable<RawMessage<ServerConfig["saves"]>>,
  z.ZodTypeAny
>;
const savesSchema = z.object({
  maxSaveFilesBackups: z.coerce.number().default(5),
  maxSaveStatesBackups: z.coerce.number().default(5),
}) satisfies z.ZodObject<SavesConfigShape>;

export function SavesConfig(props: {
  currentConfig: NonNullable<ServerConfig>;
}) {
  const navigate = useNavigate();
  const { mutate: update, status } = useUpdateServerConfig();

  const form = useForm<z.infer<typeof savesSchema>>({
    resolver: zodResolver(savesSchema),
    defaultValues: props.currentConfig.saves ?? {
      maxSaveFilesBackups: 5,
      maxSaveStatesBackups: 5,
    },
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof savesSchema>) => {
      try {
        update({
          config: {
            ...props.currentConfig,
            saves: create(SavesConfigSchema, values),
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
    <TabsContent value="saves">
      <div className="my-4 max-w-[55ch]">
        <p className="text-muted-foreground text-sm">
          Configure your cloud save and save state options here
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-2"
        >
          <FormField
            control={form.control}
            name="maxSaveFilesBackups"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Save File Backups</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxSaveStatesBackups"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Save States Backups</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="gap-2">
            <Button
              onClick={() =>
                void navigate({
                  to: ".",
                  search: (prev) => ({ ...prev, configModal: undefined }),
                })
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
