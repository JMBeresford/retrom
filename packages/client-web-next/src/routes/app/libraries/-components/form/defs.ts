import {
  createFormHookContexts,
  formOptions as formOptionsImpl,
} from "@tanstack/react-form";
import { libraryValidationSchema } from "./schema";
import type z from "zod";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const formOptions = formOptionsImpl({
  defaultValues: {
    name: "",
    path: "",
    ignorePatterns: {
      patterns: Array<string>(),
    },
    structureDefinition: "",
  } satisfies z.output<typeof libraryValidationSchema>,
  validators: {
    onChange: libraryValidationSchema,
  },
});
