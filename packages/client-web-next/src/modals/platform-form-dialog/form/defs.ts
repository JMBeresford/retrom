import {
  createFormHook,
  createFormHookContexts,
  formOptions as formOptionsImpl,
} from "@tanstack/react-form";
import { create } from "@bufbuild/protobuf";
import { PlatformMetadataSchema } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import { platformValidationSchema } from "./schema";
import { NameField } from "./fields/name";
import { SubmitButton } from "./submit-button";
import { DescriptionField } from "./fields/description";
import { LogoUrlField } from "./fields/logo-url";
import type z from "zod";

export const {
  fieldContext: platformFormFieldContext,
  formContext: platformFormContext,
  useFieldContext: usePlatformFormFieldContext,
} = createFormHookContexts();

export const defaultPlatformFormValues: z.output<
  typeof platformValidationSchema
> = create(PlatformMetadataSchema);

export const platformFormOptions = formOptionsImpl({
  formId: "platform-form",
  defaultValues: defaultPlatformFormValues,
  validators: {
    onChange: platformValidationSchema,
  },
});

export const {
  useAppForm: usePlatformForm,
  useTypedAppFormContext: usePlatformFormContext,
} = createFormHook({
  fieldContext: platformFormFieldContext,
  formContext: platformFormContext,
  fieldComponents: {
    NameField,
    DescriptionField,
    LogoUrlField,
  },
  formComponents: {
    SubmitButton,
  },
});
