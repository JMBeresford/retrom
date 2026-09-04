import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { Input } from "@retrom/ui-next/components/input";
import { useGameFormFieldContext } from "../defs";

export function CoverUrlField() {
  const field = useGameFormFieldContext<string | undefined>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      <FieldLabel>Cover</FieldLabel>

      <Input
        id={field.name}
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder="https://example.com/cover.jpg"
      />

      <FieldDescription>
        Provide a URL for the cover of your game.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
