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
import { defaultGameFormValues, gameFormOptions, useGameForm } from "./form";
import type { BaseModalActionProps } from "@/modals/modals";
import type { GameMetadata } from "@retrom/codegen/retrom/services/metadata/v1/resources_pb";
import { registerModalHandle, useModalAction } from "@/modals/use-modal-action";
import { useUpdateGameMetadata } from "@/data/metadata/use-update-game-metadata";
import { ImageUrlField } from "@/common/forms/fields/image-url-field";

export type GameFormDialogProps = Required<BaseModalActionProps> & {
  action: "update";
  currentValue: GameMetadata;
};

declare global {
  namespace RetromModals {
    interface ModalActions {
      gameForm: GameFormDialogProps;
    }
  }
}

const handle = Dialog.createHandle<GameFormDialogProps>();
registerModalHandle("gameForm", handle);

export function GameFormDialog() {
  const imageSearchDialog = useModalAction("imageSearch");
  const { mutate: updateGameMetadata } = useUpdateGameMetadata();

  const gameForm = useGameForm({
    ...gameFormOptions,
    onSubmit: ({ value, formApi }) => {
      const { payload: modalState } = handle.store.getSnapshot();

      if (!modalState) {
        throw new Error("No modal state found for game form dialog");
      }

      updateGameMetadata(
        { metadata: value },
        {
          onSuccess: () => {
            formApi.reset();
            handle.close();
          },
          onError: (error) => {
            toast.add({
              title: "Failed to update game",
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
        gameForm.reset(modalState.currentValue, {
          keepDefaultValues: false,
        });
      } else {
        gameForm.reset(defaultGameFormValues, {
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
            <gameForm.AppForm>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription render={<span>{description}</span>} />
              </DialogHeader>

              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  gameForm.handleSubmit().catch(console.error);
                }}
              >
                <gameForm.AppField name="name">
                  {(field) => <field.NameField />}
                </gameForm.AppField>

                <gameForm.AppField name="description">
                  {(field) => <field.DescriptionField />}
                </gameForm.AppField>

                <gameForm.AppField name="coverUrl">
                  {(field) => (
                    <ImageUrlField
                      name={field.name}
                      value={field.state.value}
                      onChange={field.handleChange}
                      state={field.state}
                      label="Cover Image"
                      description="Provide a URL or search for an image that will be used as the game's cover."
                    >
                      <Button
                        onClick={() =>
                          imageSearchDialog.openModal({
                            game: {
                              field: "coverUrl",
                              onSubmit: field.handleChange,
                            },
                          })
                        }
                      >
                        <Search /> Search
                      </Button>
                    </ImageUrlField>
                  )}
                </gameForm.AppField>

                <gameForm.AppField name="backgroundUrl">
                  {(field) => (
                    <ImageUrlField
                      name={field.name}
                      value={field.state.value}
                      onChange={field.handleChange}
                      state={field.state}
                      label="Background Image"
                      description="Provide a URL or search for an image that will be used as the game's background."
                    >
                      <Button
                        onClick={() =>
                          imageSearchDialog.openModal({
                            game: {
                              field: "backgroundUrl",
                              onSubmit: field.handleChange,
                            },
                          })
                        }
                      >
                        <Search /> Search
                      </Button>
                    </ImageUrlField>
                  )}
                </gameForm.AppField>

                <gameForm.AppField name="iconUrl">
                  {(field) => (
                    <ImageUrlField
                      name={field.name}
                      value={field.state.value}
                      onChange={field.handleChange}
                      state={field.state}
                      label="Icon Image"
                      description="Provide a URL or search for an image that will be used as the game's icon."
                    >
                      <Button
                        onClick={() =>
                          imageSearchDialog.openModal({
                            game: {
                              field: "iconUrl",
                              onSubmit: field.handleChange,
                            },
                          })
                        }
                      >
                        <Search /> Search
                      </Button>
                    </ImageUrlField>
                  )}
                </gameForm.AppField>
              </form>

              <DialogFooter>
                <DialogClose render={<Button variant="ghost">Close</Button>} />
                <gameForm.SubmitButton />
              </DialogFooter>
            </gameForm.AppForm>
          </DialogContent>
        );
      }}
    </Dialog>
  );
}
