import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { Input } from "@retrom/ui-next/components/input";
import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext, formOptions } from "./defs";
import { StructureDefinitionField } from "./structure-definition-dialog";

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    StructureDefinitionField,
  },
  formComponents: {},
});

export function LibraryForm() {
  const form = useAppForm({ ...formOptions });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit().catch(console.error);
      }}
    >
      <form.Field name="name">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field>
              <FieldLabel>Name</FieldLabel>

              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="My Library"
              />

              <FieldDescription>
                Provide a descriptive name for your library.
              </FieldDescription>

              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="path">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

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
                The path to the library on your filesystem.
              </FieldDescription>

              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.AppField name="structureDefinition">
        {(field) => <field.StructureDefinitionField />}
      </form.AppField>
    </form>
  );
}
