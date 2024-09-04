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
import { useConfig } from "@/providers/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function ConfigMenuItem() {
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

        <ConfigForm />
      </DialogContent>
    </Dialog>
  );
}

type Schema = z.infer<typeof mutableConfigSchema>;
const mutableConfigSchema = z.object({
  server: z.object({
    hostname: z.string().min(1).url().or(z.string().min(1).ip()),
    port: z.string().optional(),
  }),
});

function ConfigForm() {
  const configStore = useConfig();
  const currentConfig = configStore.getState();
  const { setOpen } = useDialogOpen();

  const form = useForm<Schema>({
    resolver: zodResolver(mutableConfigSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      server: {
        hostname: currentConfig.server.hostname,
        port: currentConfig.server.port.toString(),
      },
    },
  });

  const handleSubmit = useCallback(
    (values: Schema) => {
      configStore.setState((prev) => {
        const { hostname, port } = values.server;
        const portActual = port
          ? +port
          : hostname.startsWith("https")
            ? 443
            : 80;

        prev.server = {
          hostname,
          port: portActual,
        };

        return { ...prev };
      });
      setOpen(false);
    },
    [configStore, setOpen],
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
          <Button type="submit" disabled={!form.formState.isDirty}>
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
