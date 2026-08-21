import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { Input } from "@retrom/ui-next/components/input";
import {
  emulatorFormOptions,
  useEmulatorFormContext,
  useEmulatorFormFieldContext,
} from "../defs";

export function NameField() {
  const form = useEmulatorFormContext({ ...emulatorFormOptions });
  const field = useEmulatorFormFieldContext<string>();

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
        placeholder="My Emulator"
      />

      <FieldDescription>
        Provide a descriptive name for your emulator.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
