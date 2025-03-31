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
import {
  ServerConfig,
  StorageType,
} from "@retrom/codegen/retrom/server/config";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash, Undo } from "lucide-react";
import { useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { BrowseButton } from "./browse";
import { IgnorePatternsInput, IgnorePatternsTooltip } from "./ignore-patterns";
import { StorageTypeSelect } from "./storage-type";
import {
  CustomLibraryDefinitionInput,
  libraryDefinitionValidator,
} from "./custom-library-definition";
import { InferSchema } from "@/lib/utils";

export const contentDirectorySchema = z.object({
  path: z.string().min(1),
  storageType: z.nativeEnum(StorageType),
  customLibraryDefinition: libraryDefinitionValidator.default({
    definition: "",
  }),
  newly: z.enum(["added", "removed"]).optional(),
  ignorePatterns: z
    .object({
      patterns: z.string().array(),
    })
    .default({ patterns: [] }),
}) satisfies InferSchema<ServerConfig["contentDirectories"][number]>;

const librariesSchema = z.object({
  contentDirectories: z.array(
    contentDirectorySchema.refine(
      (value) =>
        !(
          value.storageType === StorageType.CUSTOM &&
          value.customLibraryDefinition.definition === ""
        ),
      {
        message: "Custom library definition cannot be empty",
        path: ["customLibraryDefinition", "definition"],
      },
    ),
  ),
}) satisfies InferSchema<Pick<ServerConfig, "contentDirectories">>;

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
    reValidateMode: "onChange",
  });

  const { append, remove, update } = useFieldArray({
    control: form.control,
    name: "contentDirectories",
  });

  const handleSubmit = useCallback(
    async (values: LibrariesSchema) => {
      const contentDirectories = values.contentDirectories.filter(
        (cd) => cd.newly !== "removed",
      );

      try {
        const res = await save({ ...props.currentConfig, contentDirectories });
        form.reset(librariesSchema.parse(res.configUpdated));
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
  const contentDirectories = form.watch("contentDirectories");

  return (
    <TabsContent value="contentDirectories">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead>Structure</TableHead>
                <TableHead>
                  Ignore Patterns <IgnorePatternsTooltip />
                </TableHead>
                <TableHead />
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {contentDirectories.map((library, index) => {
                return (
                  <TableRow key={index} className="*:py-1">
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
                    <TableCell>
                      <FormField
                        disabled={
                          library.newly === "removed" ||
                          library.storageType !== StorageType.CUSTOM
                        }
                        control={form.control}
                        name={`contentDirectories.${index}.customLibraryDefinition.definition`}
                        render={(props) => (
                          <CustomLibraryDefinitionInput
                            {...props}
                            index={index}
                          />
                        )}
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
                            const { newly: _, ...value } = library;
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
              <TableRow className="*:py-2 border-b-0">
                <TableCell colSpan={5} className="text-end">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="min-h-0 h-min w-min p-2"
                    onClick={() =>
                      append({
                        newly: "added",
                        path: "",
                        storageType: 0,
                        ignorePatterns: { patterns: [] },
                        customLibraryDefinition: { definition: "" },
                      })
                    }
                  >
                    <Plus className="h-[1rem] w-[1rem]" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </form>
      </Form>

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
