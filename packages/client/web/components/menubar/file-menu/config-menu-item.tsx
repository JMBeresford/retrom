"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useDialogOpen,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MenubarItem } from "@/components/ui/menubar";
import { RetromClientConfig } from "@/generated/retrom/client/client-config";
import { InferSchema } from "@/lib/utils";
import { useConfig } from "@/providers/config";
import { configSchema } from "@/providers/config/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function ConfigMenuItem() {
  const { config } = useConfig();

  if (config.status === "pending") {
    return (
      <MenubarItem className="text-muted-foreground/50 pointer-events-none touch-none flex gap-2">
        <LoaderCircleIcon className="animate-spin" /> Configuration
      </MenubarItem>
    );
  }

  if (config.status === "error") {
    return (
      <MenubarItem className="text-destructive-text">Configuration</MenubarItem>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <MenubarItem onSelect={(e) => e.preventDefault()}>
          Configuration
        </MenubarItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuration</DialogTitle>
        </DialogHeader>

        <ConfigForm currentConfig={config.data} />
      </DialogContent>
    </Dialog>
  );
}

type Schema = z.infer<typeof configSchema>;
function ConfigForm(props: { currentConfig: Required<RetromClientConfig> }) {
  const { setConfig } = useConfig();
  const { setOpen } = useDialogOpen();
  const form = useForm<Schema>({
    resolver: zodResolver(configSchema),
    defaultValues: props.currentConfig,
  });

  const handleSubmit = useCallback(
    (values: Schema) => {
      setConfig(values);
      setOpen(false);
    },
    [setConfig, setOpen],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-flow-col grid-cols-[1.25fr_0.5fr]">
          <FormField
            control={form.control}
            name="server.hostname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hostname</FormLabel>
                <FormControl>
                  <Input
                    className="rounded-none rounded-l-md border-r-0"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The hostname of the Retrom service
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="server.port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Port</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="rounded-none rounded-r-md"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
