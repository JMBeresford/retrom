import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { Input } from "@retrom/ui-next/components/input";
import type { BaseFieldComponentProps } from "../field-component";
import type { ReactNode } from "react";
import { usePublicUrl } from "@/api-client/use-public-url";

export type ImageUrlFieldProps = {
  children?:
    | ReactNode
    | ((fieldProps: BaseFieldComponentProps<string | undefined>) => ReactNode);
} & BaseFieldComponentProps<string | undefined>;

export function ImageUrlField({ children, ...fieldProps }: ImageUrlFieldProps) {
  const {
    name,
    label,
    description,
    value,
    onChange,
    onBlur,
    placeholder = "https://example.com/image.jpg",
    state,
  } = fieldProps;
  const publicImageUrl = usePublicUrl(value);
  const isInvalid = state.meta.isTouched && !state.meta.isValid;

  return (
    <Field>
      {label && <FieldLabel>{label}</FieldLabel>}

      {publicImageUrl && (
        <div className="relative w-full p-4 rounded-md bg-input/50">
          <img
            src={publicImageUrl}
            className="w-full max-h-40 object-contain"
          />
        </div>
      )}

      <div className="flex gap-2 items-center">
        {typeof children === "function" ? children(fieldProps) : children}
        <Input
          name={name}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}

      {isInvalid && <FieldError errors={state.meta.errors} />}
    </Field>
  );
}
