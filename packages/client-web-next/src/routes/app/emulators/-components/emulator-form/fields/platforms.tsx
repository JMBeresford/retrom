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
import type { PlatformMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import { useListPlatformMetadata } from "@/data/metadata/use-list-metadata";

export function PlatformsField() {
  const field = useEmulatorFormFieldContext<Array<string>>();

  const {
    data: allPlatformMetadata,
    isPending,
    isError,
  } = useListPlatformMetadata({
    options: {
      select: ({ metadata }) => {
        const metaByPlatformId = new Map<string, Array<PlatformMetadata>>();

        for (const meta of metadata) {
          if (!metaByPlatformId.has(meta.platform)) {
            metaByPlatformId.set(meta.platform, []);
          }

          metaByPlatformId.get(meta.platform)?.push(meta);
        }

        return metaByPlatformId;
      },
    },
  });

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const items = allPlatformMetadata
    ? Array.from(allPlatformMetadata.entries()).map(([value, metas]) => ({
        value,
        label: metas.at(0)?.name ?? "Unknown Platform",
      }))
    : [];

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
        {allPlatformMetadata.get(platform)?.at(0)?.name ?? "Unknown Platform"}
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

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
