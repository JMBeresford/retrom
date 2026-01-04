import { match } from "ts-pattern";
import { useSyncEmulatorSaves } from "@/mutations/useSyncEmulatorSaves";
import { BaseModalActionProps, useModalAction } from "@/providers/modal-action";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import {
  SaveSyncStatus,
  SyncBehavior,
  SyncEmulatorSavesResponse,
} from "@retrom/codegen/retrom/client/saves_pb";
import { Button } from "@retrom/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import {
  Item,
  ItemTitle,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemDescription,
  ItemFooter,
} from "@retrom/ui/components/item";
import { Spinner } from "@retrom/ui/components/spinner";
import { CloudIcon, ServerIcon } from "lucide-react";
import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

type Choice = "local" | "cloud" | "skip";

declare global {
  namespace RetromModals {
    interface ModalActions {
      resolveCloudSaveConflict: BaseModalActionProps & {
        status: SyncEmulatorSavesResponse;
        onResolved?: (choice: Choice, status: SaveSyncStatus) => void;
      };
    }
  }
}

export function ResolveCloudSaveConflictModal() {
  const { modalState, closeModal } = useModalAction("resolveCloudSaveConflict");
  const { status, onResolved, onClose, onOpen, description, title } =
    modalState ?? {};

  const { conflictReport } = status ?? {};

  const { mutateAsync: handleSync } = useSyncEmulatorSaves();

  const {
    mutateAsync: selectCloud,
    status: cloudStatus,
    error: cloudError,
  } = useMutation({
    mutationFn: async (emulatorId: number) =>
      handleSync({ emulatorId, behavior: SyncBehavior.FORCE_CLOUD }),
  });

  const {
    mutateAsync: selectLocal,
    status: localStatus,
    error: localError,
  } = useMutation({
    mutationFn: async (emulatorId: number) =>
      handleSync({ emulatorId, behavior: SyncBehavior.FORCE_LOCAL }),
  });

  const close = useCallback(() => {
    onClose?.();
    closeModal();
  }, [closeModal, onClose]);

  const syncSelection = useCallback(
    async (choice: Choice) => {
      if (!status) {
        return;
      }

      const emulatorId = status.emulatorId;
      const response = await match(choice)
        .with("cloud", () => selectCloud(emulatorId))
        .with("local", () => selectLocal(emulatorId))
        .with("skip", () => null)
        .exhaustive();

      if (response !== null) {
        onResolved?.(choice, response.status);
      }

      close();
    },
    [selectCloud, selectLocal, status, onResolved, close],
  );

  if (
    !conflictReport?.cloudLastModified ||
    !conflictReport?.localLastModified
  ) {
    return null;
  }

  const pending = cloudStatus === "pending" || localStatus === "pending";

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          close();
        } else {
          onOpen?.();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? "Cloud Save Conflict"}</DialogTitle>
          <DialogDescription className="max-w-[45ch]">
            {description ? (
              description
            ) : (
              <>
                Your local save data conflicts with the cloud save data. Please
                choose which version you would like to keep.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Item size="sm" variant="outline" className="max-w-[45ch]">
            <ItemMedia variant="icon">
              <CloudIcon size="lg" />
            </ItemMedia>

            <ItemContent>
              <ItemTitle className="flex items-center">Cloud Save</ItemTitle>
              <ItemDescription>
                {timestampDate(
                  conflictReport.cloudLastModified,
                ).toLocaleString()}
              </ItemDescription>
            </ItemContent>

            <ItemActions>
              <Button
                size="sm"
                disabled={pending}
                variant={match(cloudStatus)
                  .with("error", () => "destructive" as const)
                  .otherwise(() => "accent" as const)}
                onClick={() => syncSelection("cloud")}
              >
                {match(cloudStatus)
                  .with("idle", () => "Select")
                  .with("pending", () => (
                    <>
                      <Spinner />
                      Select
                    </>
                  ))
                  .with("error", () => "Retry")
                  .otherwise(() => "Select")}
              </Button>
            </ItemActions>

            {cloudError ? (
              <ItemFooter className="text-destructive-text">
                {cloudError.message}
              </ItemFooter>
            ) : (
              <></>
            )}
          </Item>

          <Item size="sm" variant="outline" className="max-w-[45ch]">
            <ItemMedia variant="icon">
              <ServerIcon />
            </ItemMedia>

            <ItemContent>
              <ItemTitle>Local Save</ItemTitle>
              <ItemDescription>
                {timestampDate(
                  conflictReport.localLastModified,
                ).toLocaleString()}
              </ItemDescription>
            </ItemContent>

            <ItemActions>
              <Button
                size="sm"
                disabled={pending}
                variant={match(localStatus)
                  .with("error", () => "destructive" as const)
                  .otherwise(() => "accent" as const)}
                onClick={() => syncSelection("local")}
              >
                {match(localStatus)
                  .with("idle", () => "Select")
                  .with("pending", () => (
                    <>
                      <Spinner />
                      Select
                    </>
                  ))
                  .with("error", () => "Retry")
                  .otherwise(() => "Select")}
              </Button>
            </ItemActions>

            {localError ? (
              <ItemFooter className="text-destructive-text">
                {localError.message}
              </ItemFooter>
            ) : (
              <></>
            )}
          </Item>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={pending} variant="ghost">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
