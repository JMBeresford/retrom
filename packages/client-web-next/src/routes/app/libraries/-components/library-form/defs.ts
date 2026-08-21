import {
  createFormHook,
  createFormHookContexts,
  formOptions as formOptionsImpl,
} from "@tanstack/react-form";
import { libraryValidationSchema } from "./schema";
import { StructureDefinitionField } from "./fields/structure-definition-dialog";
import { SubmitButton } from "./submit-button";
import { NameField } from "./fields/name";
import { PathField } from "./fields/path";
import { IgnorePatternsField } from "./fields/ignore-patterns";
import type z from "zod";

export const {
  fieldContext: libraryFormFieldContext,
  formContext: libraryFormContext,
  useFieldContext: useLibraryFormFieldContext,
  useFormContext: useLibraryFormContext,
} = createFormHookContexts();

export const defaultLibraryFormValues = {
  name: "",
  path: "",
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
    NameField,
    PathField,
    IgnorePatternsField,
    StructureDefinitionField,
  },
  formComponents: {
    SubmitButton,
  },
});
