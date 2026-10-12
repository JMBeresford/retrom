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
import { EmulatorProfileSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";
import { create } from "@bufbuild/protobuf";
import { useEmulatorProfileForm } from "./emulator-profile-form";
import {
  defaultEmulatorProfileFormValues,
  emulatorProfileFormOptions,
} from "./emulator-profile-form/defs";
import type { EmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";
import type { BaseModalActionProps } from "@/modals/modals";
import { registerModalHandle } from "@/modals/use-modal-action";
import { useCreateEmulatorProfile } from "@/data/emulators/use-create-emulator-profile";
import { useUpdateEmulatorProfile } from "@/data/emulators/use-update-emulator-profile";

export type EmulatorProfileFormDialogProps = Required<BaseModalActionProps> &
  (
    | {
        action: "create";
        /**
         * The emulator ID for which the new profile is being created.
         */
        emulator: string;
        currentValue?: never;
      }
    | {
        action: "update";
        currentValue: EmulatorProfile;
      }
  );

declare global {
  namespace RetromModals {
    interface ModalActions {
      emulatorProfileForm: EmulatorProfileFormDialogProps;
    }
  }
}

const handle = Dialog.createHandle<EmulatorProfileFormDialogProps>();
registerModalHandle("emulatorProfileForm", handle);

export function EmulatorProfileFormDialog() {
  const { mutate: createEmulatorProfile } = useCreateEmulatorProfile();
  const { mutate: updateEmulatorProfile } = useUpdateEmulatorProfile();

  const emulatorProfileForm = useEmulatorProfileForm({
    ...emulatorProfileFormOptions,
    onSubmit: ({ value, formApi }) => {
      const { payload: modalState } = handle.store.getSnapshot();

      if (!modalState) {
        throw new Error("No modal state found for emulator form dialog");
      }

      const action =
        modalState.action === "create"
          ? createEmulatorProfile
          : updateEmulatorProfile;

      action(
        { emulatorProfile: value },
        {
          onSuccess: () => {
            formApi.reset();
            handle.close();
          },
          onError: (error) => {
            toast.add({
              title:
                modalState.action === "create"
                  ? "Failed to create emulator profile"
                  : "Failed to update emulator profile",
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
        emulatorProfileForm.reset(modalState.currentValue, {
          keepDefaultValues: false,
        });
      } else {
        emulatorProfileForm.reset(
          create(EmulatorProfileSchema, {
            ...defaultEmulatorProfileFormValues,
            emulator: modalState?.emulator,
          }),
          {
            keepDefaultValues: false,
          },
        );
      }
    }
  };

  return (
    <Dialog handle={handle} onOpenChange={handleOpenChange}>
      {({ payload }) => {
        const {
          title = "Add Emulator Profile",
          description = "Configure Retrom to track a new emulator profile.",
        } = payload ?? {};

        return (
          <DialogContent>
            <emulatorProfileForm.AppForm>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription render={<span>{description}</span>} />
              </DialogHeader>

              {emulatorProfileForm.state.values.builtIn && (
                <Alert>
                  <InfoIcon />

                  <AlertTitle>Editing a built-in emulator profile</AlertTitle>

                  <AlertDescription>
                    This is a <strong>built-in</strong> emulator profile. Some
                    fields are non-configurable, and so are disabled below.
                  </AlertDescription>
                </Alert>
              )}

              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  emulatorProfileForm.handleSubmit().catch(console.error);
                }}
              >
                <emulatorProfileForm.AppField name="name">
                  {(field) => <field.NameField />}
                </emulatorProfileForm.AppField>

                <emulatorProfileForm.AppField name="customArgs">
                  {(field) => <field.CustomArgsField />}
                </emulatorProfileForm.AppField>

                <emulatorProfileForm.AppField name="supportedExtensions">
                  {(field) => <field.SupportedExtensionsField />}
                </emulatorProfileForm.AppField>
              </form>

              <DialogFooter>
                <DialogClose render={<Button variant="ghost">Close</Button>} />
                <emulatorProfileForm.SubmitButton />
              </DialogFooter>
            </emulatorProfileForm.AppForm>
          </DialogContent>
        );
      }}
    </Dialog>
  );
}
