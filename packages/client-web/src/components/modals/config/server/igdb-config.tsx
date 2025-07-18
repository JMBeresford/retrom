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
import { Input } from "@retrom/ui/components/input";
import { TabsContent } from "@retrom/ui/components/tabs";
import {
  IGDBConfigSchema,
  ServerConfig,
} from "@retrom/codegen/retrom/server/config_pb";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "@retrom/ui/components/form";
import { z } from "zod";
import { RawMessage } from "@/utils/protos";
import { create } from "@bufbuild/protobuf";
import { UpdateServerConfigRequestSchema } from "@retrom/codegen/retrom/services/server-service_pb";

type IgdbConfigShape = Record<
  keyof NonNullable<RawMessage<ServerConfig["igdb"]>>,
  z.ZodTypeAny
>;
const igdbSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
}) satisfies z.ZodObject<IgdbConfigShape>;

export function IgdbConfig(props: {
  currentConfig: NonNullable<ServerConfig>;
}) {
  const navigate = useNavigate();
  const { mutate: update, status } = useUpdateServerConfig();
  const form = useForm<z.infer<typeof igdbSchema>>({
    resolver: zodResolver(igdbSchema),
    defaultValues: props.currentConfig.igdb,
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof igdbSchema>) => {
      try {
        update(
          create(UpdateServerConfigRequestSchema, {
            config: {
              ...props.currentConfig,
              igdb: create(IGDBConfigSchema, values),
            },
          }),
        );

        form.reset(values);
      } catch (error) {
        console.error(error);
        form.reset();
      }
    },
    [props.currentConfig, form, update],
  );

  const dirty = form.formState.isDirty;
  const canSubmit = dirty && status !== "pending";

  return (
    <TabsContent value="igdb">
      <div className="my-4 max-w-[55ch]">
        <p className="text-muted-foreground text-sm">
          IGDB is the primary metadata provider for Retrom. In order to use use
          IGDB, you must provision a client ID and secret:{" "}
          <a
            href="https://github.com/JMBeresford/retrom#igdb"
            target="_blank"
            className="underline text-accent-text"
          >
            learn more
          </a>
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-2"
        >
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IGDB Client ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientSecret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IGDB Client Secret</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
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
            <Button disabled={!canSubmit} type="submit">
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
