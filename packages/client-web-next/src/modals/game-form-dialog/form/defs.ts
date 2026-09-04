import {
  createFormHook,
  createFormHookContexts,
  formOptions as formOptionsImpl,
} from "@tanstack/react-form";
import { create } from "@bufbuild/protobuf";
import { GameMetadataSchema } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import { gameValidationSchema } from "./schema";
import { NameField } from "./fields/name";
import { SubmitButton } from "./submit-button";
import { DescriptionField } from "./fields/description";
import type z from "zod";

export const {
  fieldContext: gameFormFieldContext,
  formContext: gameFormContext,
  useFieldContext: useGameFormFieldContext,
} = createFormHookContexts();

export const defaultGameFormValues: z.output<typeof gameValidationSchema> =
  create(GameMetadataSchema);

export const gameFormOptions = formOptionsImpl({
  formId: "game-form",
  defaultValues: defaultGameFormValues,
  validators: {
    onChange: gameValidationSchema,
  },
});

export const {
  useAppForm: useGameForm,
  useTypedAppFormContext: useGameFormContext,
} = createFormHook({
  fieldContext: gameFormFieldContext,
  formContext: gameFormContext,
  fieldComponents: {
    NameField,
    DescriptionField,
  },
  formComponents: {
    SubmitButton,
  },
});
