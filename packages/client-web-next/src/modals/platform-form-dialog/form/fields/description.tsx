import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { Textarea } from "@retrom/ui-next/components/textarea";
import { usePlatformFormFieldContext } from "../defs";

export function DescriptionField() {
  const field = usePlatformFormFieldContext<string | undefined>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      <FieldLabel>Description</FieldLabel>

      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />

      <FieldDescription>
        Provide a brief description of your platform.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
