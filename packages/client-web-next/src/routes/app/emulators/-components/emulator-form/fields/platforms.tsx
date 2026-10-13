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
import { Loader2, XIcon } from "lucide-react";
import { Separator } from "@retrom/ui-next/components/separator";
import { Button } from "@retrom/ui-next/components/button";
import { Badge } from "@retrom/ui-next/components/badge";
import { useEmulatorFormFieldContext } from "../defs";
import { useListPlatformMetadata } from "@/data/metadata/use-list-platform-metadata";

export function PlatformsField() {
  const field = useEmulatorFormFieldContext<Array<string>>();

  const { data, isPending, isError } = useListPlatformMetadata();

  const fieldErrors = field.state.meta.errors as Array<Error>;
  const childErrors = Object.entries(field.form.getAllErrors().fields)
    .filter(([path]) => path.startsWith(field.name))
    .map(([path, errorState]) => {
      const error = errorState.errors.at(0);

      const message =
        error && typeof error === "object" && "message" in error
          ? error.message
          : "Unknown error";

      return new Error(`${path}: ${String(message)}`);
    });

  const allErrors = [...childErrors, ...fieldErrors];

  const items =
    data?.metadata.map((meta) => ({
      value: meta.platform,
      label: meta.title,
    })) ?? [];

  const value = field.state.value;

  const triggerContent = isPending ? (
    <Loader2 className="animate-spin" />
  ) : isError ? (
    <span className="text-destructive">Error loading platforms</span>
  ) : value.length ? (
    value.map((platform, idx) => (
      <Badge
        key={platform}
        onPointerDownCapture={(e) => {
          e.stopPropagation();
          e.preventDefault();
          field.removeValue(idx);
        }}
      >
        {data.metadata.find((p) => p.platform === platform)?.title ??
          "Unknown Platform"}
        <XIcon data-icon="inline-end" />
      </Badge>
    ))
  ) : (
    <span className="text-muted-foreground">No platforms selected</span>
  );

  return (
    <Field>
      <Combobox
        multiple
        disabled={isPending || isError}
        items={items}
        value={value}
        onValueChange={field.handleChange}
      >
        <ComboboxLabel
          render={
            <FieldLabel htmlFor={field.name}>Supported Platforms</FieldLabel>
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
            <ComboboxInput
              showTrigger={false}
              placeholder="Search for a platform"
            />
          </div>

          <Separator />

          <ComboboxEmpty>No platform data found.</ComboboxEmpty>

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
        Select the platforms that this emulator supports. This emulator can only
        launch games that belong to the selected platforms.
      </FieldDescription>

      {allErrors.length > 0 && <FieldError errors={allErrors} />}
    </Field>
  );
}
