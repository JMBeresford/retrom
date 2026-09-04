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
import { Search } from "lucide-react";
import {
  defaultPlatformFormValues,
  platformFormOptions,
  usePlatformForm,
} from "./form";
import type { BaseModalActionProps } from "@/modals/modals";
import type { PlatformMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import { registerModalHandle, useModalAction } from "@/modals/use-modal-action";
import { useUpdatePlatformMetadata } from "@/data/metadata/use-update-platform-metadata";
import { ImageUrlField } from "@/common/forms/fields/image-url-field";

export type PlatformFormDialogProps = Required<BaseModalActionProps> & {
  action: "update";
  currentValue: PlatformMetadata;
};

declare global {
  namespace RetromModals {
    interface ModalActions {
      platformForm: PlatformFormDialogProps;
    }
  }
}

const handle = Dialog.createHandle<PlatformFormDialogProps>();
registerModalHandle("platformForm", handle);

export function PlatformFormDialog() {
  const imageSearchDialog = useModalAction("imageSearch");
  const { mutate: updatePlatformMetadata } = useUpdatePlatformMetadata();

  const platformForm = usePlatformForm({
    ...platformFormOptions,
    onSubmit: ({ value, formApi }) => {
      const { payload: modalState } = handle.store.getSnapshot();

      if (!modalState) {
        throw new Error("No modal state found for platform form dialog");
      }

      updatePlatformMetadata(
        { metadata: value },
        {
          onSuccess: () => {
            formApi.reset();
            handle.close();
          },
          onError: (error) => {
            toast.add({
              title: "Failed to update platform",
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
        platformForm.reset(modalState.currentValue, {
          keepDefaultValues: false,
        });
      } else {
        platformForm.reset(defaultPlatformFormValues, {
          keepDefaultValues: false,
        });
      }
    }
  };

  return (
    <Dialog handle={handle} onOpenChange={handleOpenChange}>
      {({ payload }) => {
        const { title, description } = payload ?? {};

        return (
          <DialogContent>
            <platformForm.AppForm>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription render={<span>{description}</span>} />
              </DialogHeader>

              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  platformForm.handleSubmit().catch(console.error);
                }}
              >
                <platformForm.AppField name="name">
                  {(field) => <field.NameField />}
                </platformForm.AppField>

                <platformForm.AppField name="description">
                  {(field) => <field.DescriptionField />}
                </platformForm.AppField>

                <platformForm.AppField name="logoUrl">
                  {(field) => (
                    <ImageUrlField
                      name={field.name}
                      value={field.state.value}
                      onChange={field.handleChange}
                      state={field.state}
                      label="Logo Image"
                      description="Provide a URL or search for an image that will be used as the platform's logo."
                    >
                      <Button
                        onClick={() =>
                          imageSearchDialog.openModal({
                            initialSearch: platformForm.getFieldValue("name"),
                            platform: {
                              field: "logoUrl",
                              onSubmit: field.handleChange,
                            },
                          })
                        }
                      >
                        <Search /> Search
                      </Button>
                    </ImageUrlField>
                  )}
                </platformForm.AppField>
              </form>

              <DialogFooter>
                <DialogClose render={<Button variant="ghost">Close</Button>} />
                <platformForm.SubmitButton />
              </DialogFooter>
            </platformForm.AppForm>
          </DialogContent>
        );
      }}
    </Dialog>
  );
}
