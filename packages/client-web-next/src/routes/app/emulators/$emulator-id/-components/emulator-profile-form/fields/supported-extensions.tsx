import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@retrom/ui-next/components/input-group";
import { Badge } from "@retrom/ui-next/components/badge";
import { cn } from "@retrom/ui-next/lib/utils";
import { Kbd } from "@retrom/ui-next/components/kbd";
import { useEmulatorProfileFormFieldContext } from "../defs";

export function SupportedExtensionsField() {
  const field = useEmulatorProfileFormFieldContext<Array<string>>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      <FieldLabel>Supported Extensions</FieldLabel>

      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          onBlur={(e) => {
            if (e.currentTarget.value) {
              field.handleChange([...field.state.value, e.currentTarget.value]);
              e.currentTarget.value = "";
            }

            field.handleBlur();
          }}
          onKeyDown={(e) => {
            const adding = [",", "Enter", " "].includes(e.key);
            const isEmpty = !e.currentTarget.value.length;

            if (adding) {
              e.preventDefault();
            }

            if (adding && !isEmpty) {
              field.handleChange([...field.state.value, e.currentTarget.value]);

              e.currentTarget.value = "";
            } else if (e.key === "Backspace" && isEmpty) {
              field.handleChange(field.state.value.slice(0, -1));
            }
          }}
          placeholder="Add extension (enter, space, comma to submit)"
        />

        <InputGroupAddon
          align={field.state.value.length > 0 ? "inline-start" : "inline-end"}
        >
          <InputGroupText className={cn("flex gap-1")}>
            {field.state.value.map((ext, i) => (
              <Badge
                key={i}
                variant="secondary"
                onClick={() =>
                  field.handleChange(field.state.value.filter((e) => e !== ext))
                }
                className="hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
              >
                {ext}
              </Badge>
            ))}
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      <FieldDescription>
        A list of file extensions that are supported by this emulator profile.
        For example, a profile for a SNES emulator might support the{" "}
        <Kbd className="font-mono">.sfc</Kbd> file extension.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
