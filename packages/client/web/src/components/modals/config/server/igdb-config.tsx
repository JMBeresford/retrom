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
import { ServerConfig } from "@/generated/retrom/server/config";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type IgdbConfigShape = Record<
  keyof NonNullable<ServerConfig["igdb"]>,
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
          onSubmit={() => void form.handleSubmit(handleSubmit)()}
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
              onClick={() =>
                void navigate({
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
