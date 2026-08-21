import {
  createFormHook,
  createFormHookContexts,
  formOptions as formOptionsImpl,
} from "@tanstack/react-form";
import { EmulatorSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import { create } from "@bufbuild/protobuf";
import { emulatorValidationSchema } from "./schema";
import { NameField } from "./fields/name";
import { PlatformsField } from "./fields/platforms";
import { SubmitButton } from "./submit-button";
import { OperatingSystemsField } from "./fields/operating-systems";
import type z from "zod";

export const {
  fieldContext: emulatorFormFieldContext,
  formContext: emulatorFormContext,
  useFieldContext: useEmulatorFormFieldContext,
} = createFormHookContexts();

export const defaultEmulatorFormValues: z.output<
  typeof emulatorValidationSchema
> = create(EmulatorSchema);

export const emulatorFormOptions = formOptionsImpl({
  formId: "emulator-form",
  defaultValues: defaultEmulatorFormValues,
  validators: {
    onChange: emulatorValidationSchema,
  },
});

export const {
  useAppForm: useEmulatorForm,
  useTypedAppFormContext: useEmulatorFormContext,
} = createFormHook({
  fieldContext: emulatorFormFieldContext,
  formContext: emulatorFormContext,
  fieldComponents: {
    NameField,
    PlatformsField,
    OperatingSystemsField,
  },
  formComponents: {
    SubmitButton,
  },
});
