import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StorageType } from "@/generated/retrom/models/games";
import { ServerConfig } from "@/generated/retrom/server/config";
import { cn } from "@/lib/utils";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { useModalAction } from "@/providers/modal-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
  Circle,
  FolderOpen,
  LucideProps,
  Plus,
  Trash,
  Undo,
  X,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  useFieldArray,
  UseFieldArrayAppend,
  useForm,
} from "react-hook-form";
import { z } from "zod";

type ContentDirectoryShape = Record<
  keyof ServerConfig["contentDirectories"][number],
  z.ZodTypeAny
>;
type LibrariesConfigShape = z.ZodObject<{
  contentDirectories: z.ZodArray<z.ZodObject<ContentDirectoryShape>>;
}>;

const librariesSchema = z.object({
  contentDirectories: z
    .object({
      path: z.string().min(1),
      storageType: z.nativeEnum(StorageType),
      newly: z.enum(["added", "removed"]).optional(),
    })
    .array(),
}) satisfies LibrariesConfigShape;

export function LibrariesConfig(props: {
  currentConfig: NonNullable<ServerConfig>;
}) {
  const navigate = useNavigate();
  const { mutateAsync: save, status } = useUpdateServerConfig();

  const form = useForm<z.infer<typeof librariesSchema>>({
    resolver: zodResolver(librariesSchema),
    defaultValues: props.currentConfig,
    mode: "all",
    resetOptions: { keepDirtyValues: true },
  });

  useEffect(() => {
    form.reset(props.currentConfig, { keepDirtyValues: false });
  }, [form, props.currentConfig]);

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "contentDirectories",
  });

  const handleSubmit = useCallback(
    async (values: z.infer<typeof librariesSchema>) => {
      const contentDirectories = values.contentDirectories.filter(
        (cd) => cd.newly !== "removed",
      );

      try {
        await save({ ...props.currentConfig, contentDirectories });
      } catch (error) {
        console.error(error);
        form.reset();
      }
    },
    [form, props.currentConfig, save],
  );

  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const canSubmit = isDirty && isValid && status !== "pending";

  return (
    <TabsContent value="contentDirectories">
      <Form {...form}>
        <form onSubmit={() => void form.handleSubmit(handleSubmit)()}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Path</TableHead>
                <TableHead>Structure</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((library, index) => {
                const rowDirty = Object.values(
                  form.formState.dirtyFields.contentDirectories?.at(index) ??
                    [],
                ).some(Boolean);

                function Icon(props: LucideProps) {
                  const status = library.newly;
                  const { className, ...rest } = props;

                  if (status === "added") {
                    return <Plus className={cn(className, "")} {...rest} />;
                  }

                  if (status === "removed") {
                    return (
                      <X
                        className={cn(className, "text-destructive-text")}
                        {...rest}
                      />
                    );
                  }

                  if (rowDirty) {
                    return (
                      <Circle
                        className={cn(
                          className,
                          "fill-white stroke-0 w-[0.65rem] h-[0.65rem]",
                        )}
                        {...rest}
                      />
                    );
                  }
                }

                return (
                  <TableRow key={library.id} className="*:py-1">
                    <TableCell className="pl-1 pr-0 text-right">
                      {Icon && <Icon className="w-[1rem] h-[1rem] mx-auto" />}
                    </TableCell>
                    <TableCell>
                      <FormField
                        disabled={library.newly === "removed"}
                        control={form.control}
                        name={`contentDirectories.${index}.path` as const}
                        render={BrowseButton}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        disabled={library.newly === "removed"}
                        control={form.control}
                        name={
                          `contentDirectories.${index}.storageType` as const
                        }
                        render={StorageTypeSelect}
                      />
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => {
                          if (library.newly === "added") {
                            remove(index);
                          } else if (library.newly === "removed") {
                            const { id: _, newly: __, ...value } = library;
                            update(index, value);
                          } else {
                            update(index, { ...library, newly: "removed" });
                          }
                        }}
                        variant={library.newly ? "secondary" : "destructive"}
                        className="min-h-0 h-min w-min p-2"
                      >
                        {library.newly ? (
                          <Undo className="h-[1rem] w-[1rem]" />
                        ) : (
                          <Trash className="h-[1rem] w-[1rem]" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </form>
      </Form>

      <CreateLibraryRow {...props} append={append} />

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

        <Button
          onClick={() => void form.handleSubmit(handleSubmit)()}
          disabled={!canSubmit}
        >
          Save
        </Button>
      </DialogFooter>
    </TabsContent>
  );
}

const createLibrarySchema = z.object({
  path: z.string().min(1),
  storageType: z.nativeEnum(StorageType),
}) satisfies z.ZodObject<ContentDirectoryShape>;

function CreateLibraryRow(props: {
  currentConfig: NonNullable<ServerConfig>;
  append: UseFieldArrayAppend<z.infer<typeof librariesSchema>>;
}) {
  const form = useForm<z.infer<typeof createLibrarySchema>>({
    resolver: zodResolver(createLibrarySchema),
    defaultValues: { path: "", storageType: StorageType.MULTI_FILE_GAME },
    mode: "all",
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof createLibrarySchema>) => {
      try {
        props.append({ ...values, newly: "added" });
        form.reset();
      } catch (error) {
        console.error(error);
        form.reset();
      }
    },
    [form, props],
  );

  const canSubmit = form.formState.isValid;

  return (
    <Form {...form}>
      <form onSubmit={() => void form.handleSubmit(handleSubmit)()}>
        <Table>
          <TableBody>
            <TableRow className="*:py-1">
              <TableCell />
              <TableCell>
                <FormField
                  control={form.control}
                  name="path"
                  render={BrowseButton}
                />
              </TableCell>
              <TableCell>
                <FormField
                  control={form.control}
                  name="storageType"
                  render={StorageTypeSelect}
                />
              </TableCell>
              <TableCell className="text-end">
                <Button
                  disabled={!canSubmit}
                  type="submit"
                  size="icon"
                  variant="secondary"
                  className="min-h-0 h-min w-min p-2"
                >
                  <Plus className="h-[1rem] w-[1rem]" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </form>
    </Form>
  );
}

function BrowseButton<T extends FieldValues>(props: {
  field: ControllerRenderProps<T>;
  fieldState: ControllerFieldState;
}) {
  const { openModal } = useModalAction();
  const { field, fieldState } = props;

  const browse = useCallback(
    (setValueCallback: (path: string) => void) => {
      openModal?.("serverFileExplorerModal", {
        title: "Select Library Path",
        description: "Select a directory for this library.",
        onClose: (path) => {
          if (path) {
            setValueCallback(path);
          }
        },
      });
    },
    [openModal],
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <FormItem className="flex items-center gap-2 h-min space-y-0 py-1 relative">
          <Button
            {...field}
            size="icon"
            className="min-h-0 h-min w-min p-2"
            onClick={() => browse(field.onChange)}
          >
            <FolderOpen className="h-[1rem] w-[1rem]" />
          </Button>

          <TooltipTrigger asChild>
            <FormControl>
              <Input
                {...field}
                placeholder="Select a directory..."
                className={cn(
                  "text-xs text-muted-foreground transition-colors w-[350px] overflow-hidden overflow-ellipsis",
                  "border-none font-mono placeholder:italic bg-transparent",
                  fieldState.isDirty && "text-foreground",
                )}
              />
            </FormControl>
          </TooltipTrigger>
          <TooltipContent hidden={!field.value}>{field.value}</TooltipContent>
        </FormItem>
      </Tooltip>
    </TooltipProvider>
  );
}

function StorageTypeSelect<T extends FieldValues>(props: {
  field: ControllerRenderProps<T>;
  fieldState: ControllerFieldState;
}) {
  const { field, fieldState } = props;
  const value = field.value as StorageType;

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
            <SelectValue placeholder="Select a storage type">
              {StorageTypeLabel[field.value]}
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
  [StorageType.UNRECOGNIZED]: "Unrecognized",
};
