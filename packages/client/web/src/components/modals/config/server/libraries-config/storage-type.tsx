import { ControllerFieldState, ControllerRenderProps } from "react-hook-form";
import { LibrariesSchema } from ".";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
// Import needed for reference but not directly used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { StorageType } from "@retrom/codegen/retrom/server/config_pb";

// Constants to avoid enum comparisons
const MULTI_FILE_GAME = 0; // StorageType.MULTI_FILE_GAME
const SINGLE_FILE_GAME = 1; // StorageType.SINGLE_FILE_GAME
const CUSTOM = 2; // StorageType.CUSTOM
const UNRECOGNIZED = -1; // StorageType.UNRECOGNIZED

// Map storage type numbers to labels
const storageTypeLabels: Record<number, string> = {
  [MULTI_FILE_GAME]: "Multi-file Games",
  [SINGLE_FILE_GAME]: "Single-file Games",
  [CUSTOM]: "Custom",
  [UNRECOGNIZED]: "Unrecognized",
};

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
              <p className="text-left">{storageTypeLabels[field.value] || "Unknown"}</p>
            </SelectValue>
          </SelectTrigger>
        </FormControl>

        <SelectContent>
          {[MULTI_FILE_GAME, SINGLE_FILE_GAME, CUSTOM]
            .map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {storageTypeLabels[value]}
                {value === SINGLE_FILE_GAME && (
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
