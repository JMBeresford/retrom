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
import { toast } from "@retrom/ui-next/components/toast";
import { useLibraryFormFieldContext } from "../defs";
import { useModalAction } from "@/modals/use-modal-action";
import { useRegisterHostFile } from "@/data/files/use-register-host-file";

export function FileRootField() {
  const field = useLibraryFormFieldContext<string>();
  const fileExplorerDialog = useModalAction("fileExplorer");

  const { mutateAsync: registerHostFile } = useRegisterHostFile();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      <FieldLabel>Path</FieldLabel>

      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          readOnly={true}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder="Browse for a directory"
        />

        <InputGroupAddon>
          <InputGroupButton
            variant="secondary"
            onClick={() =>
              fileExplorerDialog.openModal({
                initialPath: field.state.value,
                onConfirm: async (path) => {
                  const file = await registerHostFile({
                    absolutePath: path,
                  }).then((r) => r.file);

                  if (!file) {
                    toast.add({
                      id: "file-root-field-register-host-file-error",
                      title: "Failed to register host file",
                      description: "Please check the path and try again.",
                      type: "error",
                    });

                    return;
                  }

                  field.handleChange(file.name);
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
