import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { Input } from "@retrom/ui-next/components/input";
import {
  emulatorProfileFormOptions,
  useEmulatorProfileFormContext,
  useEmulatorProfileFormFieldContext,
} from "../defs";

export function NameField() {
  const form = useEmulatorProfileFormContext({ ...emulatorProfileFormOptions });
  const field = useEmulatorProfileFormFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      <FieldLabel>Name</FieldLabel>

      <Input
        id={field.name}
        name={field.name}
        disabled={form.state.values.builtIn}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder="My Emulator Profile"
      />

      <FieldDescription>
        Provide a descriptive name for your emulator profile.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
