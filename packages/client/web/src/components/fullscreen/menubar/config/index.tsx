import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuEntryButton } from "../menu-entry-button";
import { ComponentProps, useCallback, useState } from "react";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm, useFormContext } from "react-hook-form";
import {
  InterfaceConfig_GameListEntryImage,
  RetromClientConfig_Config,
} from "@retrom/codegen/retrom/client/client-config";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConfig, useConfigStore } from "@/providers/config";
import { ConfigInput } from "../config-inputs/input";
import { HotkeyButton } from "../../hotkey-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfigSelect, ConfigSelectItem } from "../config-inputs/select";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useToast } from "@/components/ui/use-toast";
import { FocusableElement, FocusContainer } from "../../focus-container";
import { ConfigCheckbox } from "../config-inputs/checkbox";
import { Separator } from "@/components/ui/separator";

type FormSchema = z.infer<typeof formSchema>;
const formSchema = z.object({
  interface: z.object({
    fullscreenByDefault: z.boolean(),
    fullscreenConfig: z.object({
      gridList: z.object({
        columns: z.coerce.number().min(1).max(10),
        gap: z.coerce.number().min(10).max(250),
        imageType: z.nativeEnum(InterfaceConfig_GameListEntryImage),
      }),
    }),
  }),
}) satisfies z.ZodSchema<RetromClientConfig_Config, z.ZodTypeDef, unknown>;

export function Config(props: ComponentProps<typeof SheetTrigger>) {
  const configStore = useConfigStore();
  const config = useConfig((s) => s.config);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      interface: {
        fullscreenByDefault: config?.interface?.fullscreenByDefault ?? false,
        fullscreenConfig: {
          gridList: {
            columns:
              config?.interface?.fullscreenConfig?.gridList?.columns ?? 4,
            gap: config?.interface?.fullscreenConfig?.gridList?.gap ?? 20,
            imageType:
              config?.interface?.fullscreenConfig?.gridList?.imageType ??
              InterfaceConfig_GameListEntryImage.COVER,
          },
        },
      },
    },
  });

  const formState = form.formState;
  const { isDirty, isSubmitting } = formState;

  const handleSubmit = useCallback(
    (data: FormSchema) => {
      configStore.setState((state) => ({
        ...state,
        config: {
          ...state.config,
          interface: {
            ...state.config?.interface,
            ...data.interface,
          },
        },
      }));

      toast({
        title: "Configuration updated",
      });

      form.reset(data);
      setOpen(false);
    },
    [configStore, toast, setOpen, form],
  );

  const disabled = isSubmitting || !isDirty;

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          form.reset();
        }
        setOpen(val);
      }}
    >
      <SheetTrigger asChild>
        <FocusableElement opts={{ focusKey: "config-menu-open" }}>
          <MenuEntryButton id="config-menu-open" {...props}>
            Config
          </MenuEntryButton>
        </FocusableElement>
      </SheetTrigger>

      <SheetOverlay />
      <SheetContent>
        <HotkeyLayer
          id="config-menu"
          handlers={{
            BACK: { handler: () => setOpen(false) },
            MENU: { handler: () => form.handleSubmit(handleSubmit)() },
          }}
        >
          <FocusContainer
            initialFocus
            opts={{
              focusKey: "config-menu",
              isFocusBoundary: true,
            }}
          >
            <SheetHeader>
              <SheetTitle>Configuration</SheetTitle>
              <SheetDescription>Retrom fullscreen options</SheetDescription>
            </SheetHeader>

            <Separator className="w-[90%] mx-auto" />

            <ScrollArea className="h-full w-full">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="flex flex-col justify-between h-full"
                >
                  <ConfigForm />
                </form>
              </Form>
            </ScrollArea>

            <SheetFooter>
              <SheetClose asChild>
                <HotkeyButton hotkey="BACK">back</HotkeyButton>
              </SheetClose>

              <HotkeyButton
                disabled={disabled}
                onClick={form.handleSubmit(handleSubmit)}
                hotkey="MENU"
              >
                confirm
              </HotkeyButton>
            </SheetFooter>
          </FocusContainer>
        </HotkeyLayer>
      </SheetContent>
    </Sheet>
  );
}

function ConfigForm() {
  const form = useFormContext<FormSchema>();

  return (
    <div className="flex flex-col">
      <FormField
        control={form.control}
        name="interface.fullscreenByDefault"
        render={({ field }) => {
          return (
            <FormItem>
              <ConfigCheckbox
                id="config-menu-fullscreen-default"
                label="Fullscreen by default"
                checked={field.value}
                onCheckedChange={field.onChange}
              >
                Start Retrom in fullscreen mode
              </ConfigCheckbox>
            </FormItem>
          );
        }}
      />

      <h2 className="text-lg px-4 pb-2 mt-4">Game List</h2>
      <FormField
        control={form.control}
        name="interface.fullscreenConfig.gridList.columns"
        render={({ field }) => (
          <FormItem>
            <ConfigInput
              id="config-menu-columns"
              {...field}
              type="number"
              label="Columns"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="interface.fullscreenConfig.gridList.gap"
        render={({ field }) => (
          <FormItem>
            <ConfigInput
              id="config-menu-gap"
              {...field}
              type="number"
              label="Gap"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="interface.fullscreenConfig.gridList.imageType"
        render={({ field }) => (
          <FormItem>
            <ConfigSelect
              onValueChange={(value) => field.onChange(parseInt(value))}
              defaultValue={field.value.toString()}
              triggerProps={{
                label: "Image Type",
                id: "config-image-type",
              }}
            >
              <ConfigSelectItem
                id={`config-image-type-${InterfaceConfig_GameListEntryImage.COVER}`}
                value={InterfaceConfig_GameListEntryImage.COVER.toString()}
              >
                Cover
              </ConfigSelectItem>
              <ConfigSelectItem
                id={`config-image-type-${InterfaceConfig_GameListEntryImage.BACKGROUND}`}
                value={InterfaceConfig_GameListEntryImage.BACKGROUND.toString()}
              >
                Background
              </ConfigSelectItem>
            </ConfigSelect>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
