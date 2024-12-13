import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServerConfig } from "@/generated/retrom/server/config";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { useServerConfig } from "@/queries/useServerConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useNavigate } from "@tanstack/react-router";
import { LoaderCircle, LoaderCircleIcon } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ServerTabs = Exclude<
  keyof ServerConfig,
  "connection" | "contentDirectories"
>;

export function ServerConfigTab() {
  const tabItems: Record<ServerTabs, { value: ServerTabs; name: string }> = {
    igdb: { value: "igdb", name: "IGDB" },
    steam: { value: "steam", name: "Steam" },
  };

  const { data, status } = useServerConfig();

  function LoadingState() {
    return (
      <div className="grid place-items-center py-8">
        <LoaderCircle className="w-auto h-[6rem] text-muted-foreground animate-spin stroke-1" />
      </div>
    );
  }

  function ErrorState() {
    return (
      <div className="grid place-items-center py-8 text-muted-foreground">
        <p>😔 Error loading server config </p>
      </div>
    );
  }

  return (
    <TabsContent value="server" className="flex flex-col gap-2">
      <DialogTitle className="text-xl font-extrabold">
        Server Configuration
      </DialogTitle>

      <DialogDescription className="text-pretty max-w-[60ch]">
        This is where you can configure your Retrom server settings. Settings
        here are used by all clients connected to your server.
      </DialogDescription>

      {status === "pending" ? (
        <LoadingState />
      ) : status === "error" || !data?.config ? (
        <ErrorState />
      ) : (
        <Tabs defaultValue="igdb">
          <TabsList className="w-full">
            {Object.values(tabItems).map(({ value, name }) => (
              <TabsTrigger
                key={value}
                value={value}
                style={{
                  flexBasis: `calc(1 / ${Object.values(tabItems).length} * 100%)`,
                }}
                className="text-sm"
              >
                {name}
              </TabsTrigger>
            ))}
          </TabsList>

          <Separator className="mt-4" />

          <IgdbConfig currentConfig={data.config} />
          <SteamConfig currentConfig={data.config} />
        </Tabs>
      )}
    </TabsContent>
  );
}

type IgdbConfigShape = Record<
  keyof NonNullable<ServerConfig["igdb"]>,
  z.ZodTypeAny
>;
const igdbSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
}) satisfies z.ZodObject<IgdbConfigShape>;

function IgdbConfig(props: { currentConfig: NonNullable<ServerConfig> }) {
  const navigate = useNavigate();
  const { mutate: update, status } = useUpdateServerConfig();
  const form = useForm<z.infer<typeof igdbSchema>>({
    resolver: zodResolver(igdbSchema),
    defaultValues: props.currentConfig.igdb,
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof igdbSchema>) => {
      try {
        update({ ...props.currentConfig, igdb: values });
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

          <DialogFooter>
            <Button
              onClick={() => navigate({ search: { configModal: undefined } })}
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

type SteamConfigShape = Record<
  keyof NonNullable<ServerConfig["steam"]>,
  z.ZodTypeAny
>;
const steamSchema = z.object({
  userId: z.string(),
  apiKey: z.string(),
}) satisfies z.ZodObject<SteamConfigShape>;

function SteamConfig(props: { currentConfig: NonNullable<ServerConfig> }) {
  const navigate = useNavigate();
  const { mutate: update, status } = useUpdateServerConfig();

  const form = useForm<z.infer<typeof steamSchema>>({
    resolver: zodResolver(steamSchema),
    defaultValues: props.currentConfig.steam,
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof steamSchema>) => {
      try {
        update({ ...props.currentConfig, steam: values });
        form.reset(values);
      } catch (error) {
        console.error(error);
        form.reset();
      }
    },
    [form, props.currentConfig, update],
  );

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

          <DialogFooter>
            <Button
              onClick={() => navigate({ search: { configModal: undefined } })}
              variant="secondary"
            >
              Close
            </Button>
            <Button type="submit">
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
