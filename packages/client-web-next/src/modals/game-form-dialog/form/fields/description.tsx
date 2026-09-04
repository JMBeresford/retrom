import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { Textarea } from "@retrom/ui-next/components/textarea";
import { useGameFormFieldContext } from "../defs";

export function DescriptionField() {
  const field = useGameFormFieldContext<string | undefined>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      <FieldLabel>Description</FieldLabel>

      <Textarea
        className="h-30"
        id={field.name}
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />

      <FieldDescription>
        Provide a brief description of your game.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
