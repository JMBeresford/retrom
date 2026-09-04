import type { AnyFieldApi } from "@tanstack/react-form";

export type BaseFieldComponentProps<T> = {
  name: string;
  label?: string;
  description?: string;
  value: T;
  placeholder?: string;
  state: Omit<AnyFieldApi["state"], "value">;

  onChange: (value: T) => void;
  onBlur?: () => void;
};
