import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@retrom/ui-next/components/combobox";
import { XIcon } from "lucide-react";
import { Separator } from "@retrom/ui-next/components/separator";
import { Button } from "@retrom/ui-next/components/button";
import { Badge } from "@retrom/ui-next/components/badge";
import { Emulator_OperatingSystem } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import {
  emulatorFormOptions,
  useEmulatorFormContext,
  useEmulatorFormFieldContext,
} from "../defs";

const OperatingSystemLabels: Record<Emulator_OperatingSystem, string> = {
  [Emulator_OperatingSystem.UNSPECIFIED]: "Unspecified",
  [Emulator_OperatingSystem.LINUX]: "Linux",
  [Emulator_OperatingSystem.MACOS]: "macOS",
  [Emulator_OperatingSystem.WINDOWS]: "Windows",
  [Emulator_OperatingSystem.WEB]: "Web",
};

export function OperatingSystemsField() {
  const form = useEmulatorFormContext({ ...emulatorFormOptions });
  const field = useEmulatorFormFieldContext<Array<Emulator_OperatingSystem>>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const items: Array<{ value: Emulator_OperatingSystem; label: string }> =
    Object.entries(OperatingSystemLabels)
      .map(([value, label]) => ({
        value: Number(value),
        label,
      }))
      .filter(
        ({ value }) => value !== Emulator_OperatingSystem.UNSPECIFIED.valueOf(),
      );

  const value = field.state.value;

  const triggerContent = value.length ? (
    value.map((os, idx) => (
      <Badge
        key={os}
        onPointerDownCapture={(e) => {
          e.stopPropagation();
          e.preventDefault();
          field.removeValue(idx);
        }}
      >
        {OperatingSystemLabels[os]}
        <XIcon data-icon="inline-end" />
      </Badge>
    ))
  ) : (
    <span className="text-muted-foreground">No operating systems selected</span>
  );

  return (
    <Field>
      <Combobox
        multiple
        disabled={form.state.values.builtIn}
        items={items}
        value={value}
        onValueChange={field.handleChange}
      >
        <ComboboxLabel
          render={
            <FieldLabel htmlFor={field.name}>
              Supported Operating Systems
            </FieldLabel>
          }
        />

        <ComboboxTrigger
          name={field.name}
          render={
            <Button
              variant="outline"
              className="justify-start flex-wrap overflow-x-hidden h-auto min-h-8 py-1"
            >
              {triggerContent}
            </Button>
          }
        />

        <ComboboxContent>
          <div className="p-2">
            <ComboboxInput showTrigger={false} placeholder="Search for an OS" />
          </div>

          <Separator />

          <ComboboxEmpty>No OS data found.</ComboboxEmpty>

          <ComboboxList>
            {(item: { label: string; value: string }) => {
              return (
                <ComboboxItem key={item.value} value={item.value}>
                  {item.label}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <FieldDescription>
        Optionally select the operating systems that this emulator supports. If
        this is populated, Retrom will only launch games via this emulator on
        clients that are running one of the selected operating systems.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
