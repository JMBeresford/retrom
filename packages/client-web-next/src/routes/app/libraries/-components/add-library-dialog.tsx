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
import { formOptions } from "./form/defs";
import type { BaseModalActionProps } from "@/modals/modals";
import { useModalAction } from "@/modals/use-modal-action";
import { useCreateLibrary } from "@/data/libraries/use-create-library";

export type AddLibraryDialogProps = BaseModalActionProps;

declare global {
  namespace RetromModals {
    interface ModalActions {
      addLibrary: AddLibraryDialogProps;
    }
  }
}

export function AddLibraryDialog() {
  const dialog = useModalAction("addLibrary");
  const { mutateAsync: createLibrary } = useCreateLibrary();

  const libraryForm = useAppForm({
    ...formOptions,
    onSubmit: async ({ value, formApi }) => {
      await createLibrary(
        { library: value },
        {
          onSuccess: () => {
            formApi.reset();
          },
          onError: (error) => {
            toast.add({
              title: "Failed to create library",
              type: "error",
              description: error.message,
            });
          },
        },
      );
    },
  });

  return (
    <Dialog
      open={!!dialog.modalState?.open}
      onOpenChange={(open) => {
        if (!open) {
          dialog.closeModal();
        }
      }}
    >
      <DialogContent>
        <libraryForm.AppForm>
          <DialogHeader>
            <DialogTitle>Add Library</DialogTitle>
            <DialogDescription>
              Configure Retrom to track a new library.
            </DialogDescription>
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

            <libraryForm.AppField name="ignorePatterns.patterns">
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
    </Dialog>
  );
}
