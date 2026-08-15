import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui-next/components/dialog";
import { Button } from "@retrom/ui-next/components/button";
import { toast } from "@retrom/ui-next/components/toast";
import { useAppForm } from "./form";
import { defaultValues, formOptions } from "./form/defs";
import type { BaseModalActionProps } from "@/modals/modals";
import type { Library } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import { useCreateLibrary } from "@/data/libraries/use-create-library";
import { registerModalHandle } from "@/modals/use-modal-action";
import { useUpdateLibrary } from "@/data/libraries/use-update-library";

export type LibraryFormDialogProps = BaseModalActionProps &
  (
    | {
        action: "create";
        currentValue?: never;
      }
    | {
        action: "update";
        currentValue: Library;
      }
  );

declare global {
  namespace RetromModals {
    interface ModalActions {
      libraryForm: LibraryFormDialogProps;
    }
  }
}

const handle = Dialog.createHandle<LibraryFormDialogProps>();
registerModalHandle("libraryForm", handle);

export function LibraryFormDialog() {
  const { mutate: createLibrary } = useCreateLibrary();
  const { mutate: updateLibrary } = useUpdateLibrary();

  const libraryForm = useAppForm({
    ...formOptions,
    onSubmit: ({ value, formApi }) => {
      const { payload: modalState } = handle.store.getSnapshot();

      if (!modalState) {
        throw new Error("No modal state found for library form dialog");
      }

      const action =
        modalState.action === "create" ? createLibrary : updateLibrary;

      action(
        { library: value },
        {
          onSuccess: () => {
            formApi.reset();
            handle.close();
          },
          onError: (error) => {
            toast.add({
              title:
                modalState.action === "create"
                  ? "Failed to create library"
                  : "Failed to update library",
              type: "error",
              description: error.message,
            });
          },
        },
      );
    },
  });

  const handleOpenChange = (open: boolean) => {
    const { payload: modalState } = handle.store.getSnapshot();

    if (open) {
      if (modalState?.action === "update") {
        libraryForm.reset(modalState.currentValue, {
          keepDefaultValues: false,
        });
      } else {
        libraryForm.reset(defaultValues, { keepDefaultValues: false });
      }
    }
  };

  return (
    <Dialog handle={handle} onOpenChange={handleOpenChange}>
      {({ payload }) => {
        const {
          title = "Add Library",
          description = "Configure Retrom to track a new library.",
        } = payload ?? {};

        return (
          <DialogContent>
            <libraryForm.AppForm>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription render={<span>{description}</span>} />
              </DialogHeader>

              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  libraryForm.handleSubmit().catch(console.error);
                }}
              >
                <libraryForm.AppField name="name">
                  {(field) => <field.NameField />}
                </libraryForm.AppField>

                <libraryForm.AppField name="path">
                  {(field) => <field.PathField />}
                </libraryForm.AppField>

                <libraryForm.AppField name="ignorePatterns">
                  {(field) => <field.IgnorePatternsField />}
                </libraryForm.AppField>

                <libraryForm.AppField name="structureDefinition">
                  {(field) => <field.StructureDefinitionField />}
                </libraryForm.AppField>
              </form>

              <DialogFooter>
                <DialogClose render={<Button variant="ghost">Close</Button>} />
                <libraryForm.SubmitButton />
              </DialogFooter>
            </libraryForm.AppForm>
          </DialogContent>
        );
      }}
    </Dialog>
  );
}
