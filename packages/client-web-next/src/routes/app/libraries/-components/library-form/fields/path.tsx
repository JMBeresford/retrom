import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@retrom/ui-next/components/input-group";
import { FolderOpenIcon } from "lucide-react";
import { useLibraryFormFieldContext } from "../defs";
import { useModalAction } from "@/modals/use-modal-action";

export function PathField() {
  const field = useLibraryFormFieldContext<string>();
  const fileExplorerDialog = useModalAction("fileExplorer");

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      <FieldLabel>Path</FieldLabel>

      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder="/path/to/library"
        />

        <InputGroupAddon>
          <InputGroupButton
            variant="secondary"
            onClick={() =>
              fileExplorerDialog.openModal({
                initialPath: field.state.value,
                onConfirm: (path) => {
                  field.handleChange(path);
                },
              })
            }
          >
            <FolderOpenIcon /> Browse
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <FieldDescription>
        The path to the library on the filesystem.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
