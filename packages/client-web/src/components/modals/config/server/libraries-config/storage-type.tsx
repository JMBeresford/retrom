import {
  ControllerFieldState,
  ControllerRenderProps,
} from "@retrom/ui/components/form";
import { LibrariesSchema } from ".";
import { FormControl, FormItem, FormLabel } from "@retrom/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@retrom/ui/components/select";
import { cn } from "@retrom/ui/lib/utils";
import { Badge } from "@retrom/ui/components/badge";
import { StorageType } from "@retrom/codegen/retrom/server/config_pb";

export function StorageTypeSelect<
  Field extends ControllerRenderProps<
    LibrariesSchema,
    `contentDirectories.${number}.storageType`
  >,
>(props: { field: Field; fieldState: ControllerFieldState }) {
  const { field, fieldState } = props;

  return (
    <FormItem className="sm:contents sm:space-y-0 w-full">
      <FormLabel className="sm:hidden whitespace-nowrap">
        Storage Type
      </FormLabel>
      <Select
        disabled={field.disabled}
        value={field.value.toString()}
        onValueChange={(value) => field.onChange(parseInt(value))}
      >
        <FormControl>
          <SelectTrigger
            className={cn(
              "sm:border-transparent bg-transparent hover:bg-transparent",
              "flex justify-between gap-2 text-muted-foreground sm:px-0",
              fieldState.isDirty && "text-foreground",
            )}
          >
            <SelectValue asChild placeholder="Select a storage type">
              <p className="text-left">{StorageTypeLabel[field.value]}</p>
            </SelectValue>
          </SelectTrigger>
        </FormControl>

        <SelectContent>
          {Object.values(StorageType)
            .filter((type) => typeof type === "number")
            .map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {StorageTypeLabel[value]}
                {value === StorageType.SINGLE_FILE_GAME && (
                  <Badge variant="outline" className="mx-2">
                    Default
                  </Badge>
                )}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </FormItem>
  );
}

const StorageTypeLabel: Record<StorageType, string> = {
  [StorageType.MULTI_FILE_GAME]: "Multi-file Games",
  [StorageType.SINGLE_FILE_GAME]: "Single-file Games",
  [StorageType.CUSTOM]: "Custom",
};
