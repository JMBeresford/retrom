import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { StorageType } from "@/generated/retrom/models/games";
import { ServerConfig } from "@/generated/retrom/server/config";
import { cn } from "@/lib/utils";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Circle, LucideProps, Plus, Trash, Undo, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useFieldArray, UseFieldArrayAppend, useForm } from "react-hook-form";
import { z } from "zod";
import { BrowseButton } from "./browse";
import { IgnorePatternsInput, IgnorePatternsTooltip } from "./ignore-patterns";
import { StorageTypeSelect } from "./storage-type";

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
      ignorePatterns: z
        .object({
          patterns: z.string().array(),
        })
        .catch({ patterns: [] }),
    })
    .array(),
}) satisfies LibrariesConfigShape;

export type LibrariesSchema = z.infer<typeof librariesSchema>;
export function LibrariesConfig(props: {
  currentConfig: NonNullable<ServerConfig>;
}) {
  const navigate = useNavigate();
  const { mutateAsync: save, status } = useUpdateServerConfig();

  const form = useForm<LibrariesSchema>({
    resolver: zodResolver(librariesSchema),
    defaultValues: librariesSchema.parse(props.currentConfig),
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
    async (values: LibrariesSchema) => {
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
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Path</TableHead>
                <TableHead>Structure</TableHead>
                <TableHead>
                  Ignore Patterns <IgnorePatternsTooltip />
                </TableHead>
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
                    <TableCell className="w-[150px]">
                      <FormField
                        disabled={library.newly === "removed"}
                        control={form.control}
                        name={`contentDirectories.${index}.ignorePatterns.patterns`}
                        render={IgnorePatternsInput}
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
            navigate({
              search: (prev) => ({ ...prev, configModal: undefined }),
            })
          }
          variant="secondary"
        >
          Close
        </Button>

        <Button onClick={form.handleSubmit(handleSubmit)} disabled={!canSubmit}>
          Save
        </Button>
      </DialogFooter>
    </TabsContent>
  );
}

const createLibrarySchema = z.object({
  path: z.string().min(1),
  storageType: z.nativeEnum(StorageType),
  ignorePatterns: z
    .object({
      patterns: z.string().array(),
    })
    .catch({ patterns: [] }),
}) satisfies z.ZodObject<ContentDirectoryShape>;

export type CreateLibrarySchema = z.infer<typeof createLibrarySchema>;
function CreateLibraryRow(props: {
  currentConfig: NonNullable<ServerConfig>;
  append: UseFieldArrayAppend<LibrariesSchema, "contentDirectories">;
}) {
  const form = useForm<CreateLibrarySchema>({
    resolver: zodResolver(createLibrarySchema),
    defaultValues: {
      path: "",
      storageType: StorageType.MULTI_FILE_GAME,
      ignorePatterns: { patterns: [] },
    },
    mode: "all",
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof createLibrarySchema>) => {
      try {
        props.append({ ...values, newly: "added" }, { shouldFocus: false });
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
      <form onSubmit={form.handleSubmit(handleSubmit)}>
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
              <TableCell className="w-[150px]">
                <FormField
                  control={form.control}
                  name="ignorePatterns.patterns"
                  render={IgnorePatternsInput}
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
