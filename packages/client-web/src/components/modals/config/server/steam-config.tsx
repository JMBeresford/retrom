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
  ServerConfig,
  SteamConfigSchema,
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

type SteamConfigShape = Record<
  keyof NonNullable<RawMessage<ServerConfig>["steam"]>,
  z.ZodTypeAny
>;
const steamSchema = z.object({
  userId: z.string(),
  apiKey: z.string(),
}) satisfies z.ZodObject<SteamConfigShape>;

export function SteamConfig(props: {
  currentConfig: NonNullable<ServerConfig>;
}) {
  const navigate = useNavigate();
  const { mutate: update, status } = useUpdateServerConfig();

  const form = useForm<z.infer<typeof steamSchema>>({
    resolver: zodResolver(steamSchema),
    defaultValues: props.currentConfig.steam,
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof steamSchema>) => {
      try {
        update({
          config: {
            ...props.currentConfig,
            steam: create(SteamConfigSchema, values),
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
    <TabsContent value="steam">
      <div className="my-4 max-w-[55ch]">
        <p className="text-muted-foreground text-sm">
          You can link your Steam account to access your game library directly
          in Retrom. In order to do this, you must provide your Steam User ID
          and API key:{" "}
          <a
            href="https://github.com/JMBeresford/retrom#steam"
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
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Steam User ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Steam API Key</FormLabel>
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
