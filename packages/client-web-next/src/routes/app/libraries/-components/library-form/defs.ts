import {
  createFormHook,
  createFormHookContexts,
  formOptions as formOptionsImpl,
} from "@tanstack/react-form";
import { libraryValidationSchema } from "./schema";
import { StructureDefinitionField } from "./fields/structure-definition-dialog";
import { SubmitButton } from "./submit-button";
import { DisplayNameField } from "./fields/display-name";
import { FileRootField } from "./fields/file-root";
import { IgnorePatternsField } from "./fields/ignore-patterns";
import type z from "zod";

export const {
  fieldContext: libraryFormFieldContext,
  formContext: libraryFormContext,
  useFieldContext: useLibraryFormFieldContext,
  useFormContext: useLibraryFormContext,
} = createFormHookContexts();

export const defaultLibraryFormValues = {
  displayName: "",
  fileRoot: "",
  structureDefinition: "{library}/{platform}/{game}",
  ignorePatterns: Array<string>(),
} satisfies z.output<typeof libraryValidationSchema>;

export const libraryFormOptions = formOptionsImpl({
  formId: "library-form",
  defaultValues: defaultLibraryFormValues,
  validators: {
    onChange: libraryValidationSchema,
  },
});

export const { useAppForm: useLibraryForm } = createFormHook({
  fieldContext: libraryFormFieldContext,
  formContext: libraryFormContext,
  fieldComponents: {
    DisplayNameField,
    FileRootField,
    IgnorePatternsField,
    StructureDefinitionField,
  },
  formComponents: {
    SubmitButton,
  },
});
