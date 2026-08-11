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

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const defaultValues = {
  name: "",
  path: "",
  ignorePatterns: {
    patterns: Array<string>(),
  },
  structureDefinition: "{library}/{platform}/{game}",
} satisfies z.output<typeof libraryValidationSchema>;

export const formOptions = formOptionsImpl({
  formId: "library-form",
  defaultValues,
  validators: {
    onChange: libraryValidationSchema,
  },
});

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
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
