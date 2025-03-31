import { ControllerFieldState, ControllerRenderProps } from "react-hook-form";
import { LibrariesSchema } from ".";
import { FormControl, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StorageType } from "@retrom/codegen/retrom/server/config";

export function StorageTypeSelect<
  Field extends ControllerRenderProps<
    LibrariesSchema,
    `contentDirectories.${number}.storageType`
  >,
>(props: { field: Field; fieldState: ControllerFieldState }) {
  const { field, fieldState } = props;
  const value = field.value;

  return (
    <FormItem>
      <Select
        disabled={field.disabled}
        value={value.toString()}
        onValueChange={(value) => field.onChange(parseInt(value))}
      >
        <FormControl>
          <SelectTrigger
            className={cn(
              "border-transparent bg-transparent hover:bg-transparent",
              "flex justify-between gap-2 text-muted-foreground px-0",
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
            .filter((type) => type >= 0)
            .map((type) => (
              <SelectItem key={type} value={type.toString()}>
                {StorageTypeLabel[type]}
                {type === StorageType.MULTI_FILE_GAME && (
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
  [StorageType.UNRECOGNIZED]: "Unrecognized",
};
