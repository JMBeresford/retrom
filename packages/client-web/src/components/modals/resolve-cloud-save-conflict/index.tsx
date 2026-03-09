import { match } from "ts-pattern";
import { useSyncEmulatorSaves } from "@/mutations/useSyncEmulatorSaves";
import { BaseModalActionProps, useModalAction } from "@/providers/modal-action";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import {
  SaveSyncStatus,
  SyncBehavior,
  SyncEmulatorSavesResponse,
  SyncEmulatorSaveStatesResponse,
} from "@retrom/codegen/retrom/client/saves_pb";
import { Button } from "@retrom/ui/components/button";
import {
  Dialog,
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
import { useSyncEmulatorSaveStates } from "@/mutations/useSyncEmulatorSaveStates";

type Choice = "local" | "cloud" | "skip";

declare global {
  namespace RetromModals {
    interface ModalActions {
      resolveCloudSaveConflict: BaseModalActionProps & {
        onResolved?: (
          choice: Choice,
          status: SaveSyncStatus,
        ) => Promise<void> | void;
      } & (
          | {
              saveKind: "saves";
              status: SyncEmulatorSavesResponse;
            }
          | {
              saveKind: "saveStates";
              status: SyncEmulatorSaveStatesResponse;
            }
        );
    }
  }
}

export function ResolveCloudSaveConflictModal() {
  const { modalState, closeModal } = useModalAction("resolveCloudSaveConflict");
  const { status, onResolved, onClose, onOpen, description, title, saveKind } =
    modalState ?? {};

  const { conflictReport } = status ?? {};

  const { mutateAsync: handleSyncSaves } = useSyncEmulatorSaves();
  const { mutateAsync: handleSyncSaveStates } = useSyncEmulatorSaveStates();

  const handleSync = useCallback(
    (params: { emulatorId: number; behavior: SyncBehavior }) => {
      if (saveKind === "saves") {
        return handleSyncSaves(params);
      } else {
        return handleSyncSaveStates(params);
      }
    },
    [saveKind, handleSyncSaves, handleSyncSaveStates],
  );

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
        .with("skip", () => ({ status: SaveSyncStatus.UNSPECIFIED }))
        .exhaustive();

      if (response !== null) {
        await onResolved?.(choice, response.status);
      }

      close();
    },
    [selectCloud, selectLocal, status, onResolved, close],
  );

  const { cloudLastModified, localLastModified } = conflictReport ?? {};

  const pending = cloudStatus === "pending" || localStatus === "pending";

  return (
    <Dialog
      open={!!modalState?.open}
      onOpenChange={(open) => {
        if (!open) {
          close();
        } else {
          onOpen?.();
        }
      }}
    >
      <DialogContent userCanClose={false}>
        <DialogHeader>
          <DialogTitle>
            {title ??
              `Cloud ${saveKind === "saves" ? "Save" : "Save States"} Conflict`}
          </DialogTitle>
          <DialogDescription className="max-w-[45ch]">
            {description ? (
              description
            ) : (
              <>
                Your local {saveKind === "saves" ? "save" : "save state"} data
                conflicts with the cloud{" "}
                {saveKind === "saves" ? "save" : "save state"} data. Please
                choose which version you would like to keep.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Item size="sm" variant="outline" className="max-w-[45ch]">
            <ItemMedia variant="icon">
              <CloudIcon />
            </ItemMedia>

            <ItemContent>
              <ItemTitle className="flex items-center">
                Cloud {saveKind === "saves" ? "Save" : "Save States"}
              </ItemTitle>
              <ItemDescription>
                {cloudLastModified
                  ? timestampDate(cloudLastModified).toLocaleString()
                  : "No cloud data found"}
              </ItemDescription>
            </ItemContent>

            <ItemActions>
              <Button
                type="button"
                size="sm"
                disabled={pending || !cloudLastModified}
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
              <ItemTitle>
                Local {saveKind === "saves" ? "Save" : "Save States"}
              </ItemTitle>
              <ItemDescription>
                {localLastModified
                  ? timestampDate(localLastModified).toLocaleString()
                  : "No local data found"}
              </ItemDescription>
            </ItemContent>

            <ItemActions>
              <Button
                type="button"
                size="sm"
                disabled={pending || !localLastModified}
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
          <Button
            type="button"
            disabled={pending}
            variant="ghost"
            onClick={() => syncSelection("skip")}
          >
            Skip syncing for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
