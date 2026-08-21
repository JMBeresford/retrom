import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@retrom/ui-next/components/alert";
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
import { InfoIcon } from "lucide-react";
import { useEmulatorForm } from "./emulator-form";
import {
  defaultEmulatorFormValues,
  emulatorFormOptions,
} from "./emulator-form/defs";
import type { BaseModalActionProps } from "@/modals/modals";
import type { Emulator } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import { registerModalHandle } from "@/modals/use-modal-action";
import { useCreateEmulator } from "@/data/emulators/use-create-emulator";
import { useUpdateEmulator } from "@/data/emulators/use-update-emulator";

export type EmulatorFormDialogProps = BaseModalActionProps &
  (
    | {
        action: "create";
        currentValue?: never;
      }
    | {
        action: "update";
        currentValue: Emulator;
      }
  );

declare global {
  namespace RetromModals {
    interface ModalActions {
      emulatorForm: EmulatorFormDialogProps;
    }
  }
}

const handle = Dialog.createHandle<EmulatorFormDialogProps>();
registerModalHandle("emulatorForm", handle);

export function EmulatorFormDialog() {
  const { mutate: createEmulator } = useCreateEmulator();
  const { mutate: updateEmulator } = useUpdateEmulator();

  const emulatorForm = useEmulatorForm({
    ...emulatorFormOptions,
    onSubmit: ({ value, formApi }) => {
      const { payload: modalState } = handle.store.getSnapshot();

      if (!modalState) {
        throw new Error("No modal state found for emulator form dialog");
      }

      const action =
        modalState.action === "create" ? createEmulator : updateEmulator;

      action(
        { emulator: value },
        {
          onSuccess: () => {
            formApi.reset();
            handle.close();
          },
          onError: (error) => {
            toast.add({
              title:
                modalState.action === "create"
                  ? "Failed to create emulator"
                  : "Failed to update emulator",
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
        emulatorForm.reset(modalState.currentValue, {
          keepDefaultValues: false,
        });
      } else {
        emulatorForm.reset(defaultEmulatorFormValues, {
          keepDefaultValues: false,
        });
      }
    }
  };

  return (
    <Dialog handle={handle} onOpenChange={handleOpenChange}>
      {({ payload }) => {
        const {
          title = "Add Emulator",
          description = "Configure Retrom to track a new emulator.",
        } = payload ?? {};

        return (
          <DialogContent>
            <emulatorForm.AppForm>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription render={<span>{description}</span>} />
              </DialogHeader>

              {emulatorForm.state.values.builtIn && (
                <Alert>
                  <InfoIcon />

                  <AlertTitle>Editing a built-in emulator</AlertTitle>

                  <AlertDescription>
                    This is a <strong>built-in</strong> emulator. Some fields
                    are non-configurable, and so are disabled below.
                  </AlertDescription>
                </Alert>
              )}

              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  emulatorForm.handleSubmit().catch(console.error);
                }}
              >
                <emulatorForm.AppField name="name">
                  {(field) => <field.NameField />}
                </emulatorForm.AppField>

                <emulatorForm.AppField name="platforms">
                  {(field) => <field.PlatformsField />}
                </emulatorForm.AppField>

                <emulatorForm.AppField name="operatingSystems">
                  {(field) => <field.OperatingSystemsField />}
                </emulatorForm.AppField>
              </form>

              <DialogFooter>
                <DialogClose render={<Button variant="ghost">Close</Button>} />
                <emulatorForm.SubmitButton />
              </DialogFooter>
            </emulatorForm.AppForm>
          </DialogContent>
        );
      }}
    </Dialog>
  );
}
