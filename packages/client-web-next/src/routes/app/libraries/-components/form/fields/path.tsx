import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { Input } from "@retrom/ui-next/components/input";
import { useFieldContext } from "../defs";

export function PathField() {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      <FieldLabel>Path</FieldLabel>

      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder="/path/to/library"
      />

      <FieldDescription>
        The path to the library on the filesystem.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
