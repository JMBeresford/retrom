import {
  createFormHook,
  createFormHookContexts,
  formOptions as formOptionsImpl,
} from "@tanstack/react-form";
import { create } from "@bufbuild/protobuf";
import { EmulatorProfileSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";
import { emulatorProfileValidationSchema } from "./schema";
import { NameField } from "./fields/name";
import { SubmitButton } from "./submit-button";
import { CustomArgsField } from "./fields/custom-args";
import { SupportedExtensionsField } from "./fields/supported-extensions";
import type z from "zod";

export const {
  fieldContext: emulatorProfileFormFieldContext,
  formContext: emulatorProfileFormContext,
  useFieldContext: useEmulatorProfileFormFieldContext,
} = createFormHookContexts();

export const defaultEmulatorProfileFormValues: z.output<
  typeof emulatorProfileValidationSchema
> = create(EmulatorProfileSchema);

export const emulatorProfileFormOptions = formOptionsImpl({
  formId: "emulator-form",
  defaultValues: defaultEmulatorProfileFormValues,
  validators: {
    onChange: emulatorProfileValidationSchema,
  },
});

export const {
  useAppForm: useEmulatorProfileForm,
  useTypedAppFormContext: useEmulatorProfileFormContext,
} = createFormHook({
  fieldContext: emulatorProfileFormFieldContext,
  formContext: emulatorProfileFormContext,
  fieldComponents: {
    NameField,
    CustomArgsField,
    SupportedExtensionsField,
  },
  formComponents: {
    SubmitButton,
  },
});
