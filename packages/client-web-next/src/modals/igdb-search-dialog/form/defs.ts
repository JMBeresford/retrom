import {
  createFormHook,
  createFormHookContexts,
  formOptions as formOptionsImpl,
} from "@tanstack/react-form";
import { igdbSearchValidationSchema } from "./schema";
import { SearchButton } from "./search-button";
import type z from "zod";

export const {
  fieldContext: igdbSearchFormFieldContext,
  formContext: igdbSearchFormContext,
  useFieldContext: useIgdbSearchFormFieldContext,
} = createFormHookContexts();

export const defaultIgdbSearchFormValues: z.output<
  typeof igdbSearchValidationSchema
> = {
  name: "",
};

export const igdbSearchFormOptions = formOptionsImpl({
  formId: "igdbSearch-form",
  defaultValues: defaultIgdbSearchFormValues,
  validators: {
    onChange: igdbSearchValidationSchema,
  },
});

export const {
  useAppForm: useIgdbSearchForm,
  useTypedAppFormContext: useIgdbSearchFormContext,
} = createFormHook({
  fieldContext: igdbSearchFormFieldContext,
  formContext: igdbSearchFormContext,
  fieldComponents: {},
  formComponents: {
    SearchButton,
  },
});
