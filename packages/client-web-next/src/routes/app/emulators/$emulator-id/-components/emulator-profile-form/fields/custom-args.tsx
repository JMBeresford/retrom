import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { Input } from "@retrom/ui-next/components/input";
import { Kbd } from "@retrom/ui-next/components/kbd";
import {
  emulatorProfileFormOptions,
  useEmulatorProfileFormContext,
  useEmulatorProfileFormFieldContext,
} from "../defs";

export function CustomArgsField() {
  const form = useEmulatorProfileFormContext({ ...emulatorProfileFormOptions });
  const field = useEmulatorProfileFormFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      <FieldLabel>Launch Arguments</FieldLabel>

      <Input
        id={field.name}
        name={field.name}
        disabled={form.state.values.builtIn}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder="--my-arg=value {file}"
      />

      <FieldDescription>
        Provide any custom launch arguments for the emulator. You must use
        placeholders like <Kbd className="font-mono">{"{file}"}</Kbd> or{" "}
        <Kbd className="font-mono">{"{install_dir}"}</Kbd> to represent the path
        to the game file or the installation directory, respectively.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
