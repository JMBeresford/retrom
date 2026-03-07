import { useRestoreSavesFromBackup } from "@/mutations/useRestoreSavesFromBackup";
import { useRestoreSaveStatesFromBackup } from "@/mutations/useRestoreSaveStatesFromBackup";
import { useSyncEmulatorSaves } from "@/mutations/useSyncEmulatorSaves";
import { useSyncEmulatorSaveStates } from "@/mutations/useSyncEmulatorSaveStates";
import { BaseModalActionProps, useModalAction } from "@/providers/modal-action";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import { SyncBehavior } from "@retrom/codegen/retrom/client/saves_pb";
import { Backup } from "@retrom/codegen/retrom/services/saves/v2/emulator-saves-service_pb";
import { Button } from "@retrom/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import { Item, ItemContent, ItemActions } from "@retrom/ui/components/item";
import { toast } from "@retrom/ui/components/toast";
import { cn } from "@retrom/ui/lib/utils";
import { RotateCcwIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

declare global {
  namespace RetromModals {
    interface ModalActions {
      restoreCloudSaves: BaseModalActionProps & {
        emulatorId: number;
        emulatorName: string;
        backups: Backup[];
      } & (
          | {
              saveKind: "saves";
            }
          | {
              saveKind: "saveStates";
            }
        );
    }
  }
}

export function RestoreCloudSavesModal() {
  const { modalState, closeModal } = useModalAction("restoreCloudSaves");
  const {
    saveKind,
    title,
    description,
    onOpen,
    onClose,
    emulatorId,
    backups,
    emulatorName = "Unknown Emulator",
  } = modalState ?? {};

  const [restoring, setRestoring] = useState<null | string>(null);
  const close = useCallback(() => {
    onClose?.();
    closeModal();
  }, [onClose, closeModal]);

  const {
    mutateAsync: restoreSaves,
    status: restoreSavesStatus,
    error: savesError,
  } = useRestoreSavesFromBackup();

  const {
    mutateAsync: restoreSaveStates,
    status: restoreSaveStatesStatus,
    error: saveStatesError,
  } = useRestoreSaveStatesFromBackup();

  const { mutateAsync: handleSyncSaves } = useSyncEmulatorSaves();
  const { mutateAsync: handleSyncSaveStates } = useSyncEmulatorSaveStates();

  const selectBackup = useCallback(
    async (backup: Backup) => {
      if (emulatorId === undefined) {
        console.error("Emulator ID is required to restore backup");
        return;
      }

      setRestoring(backup.backupId);

      try {
        if (saveKind === "saves") {
          await restoreSaves({
            saveFilesSelectors: [{ emulatorId, backup }],
          });

          await handleSyncSaves({
            emulatorId,
            behavior: SyncBehavior.FORCE_CLOUD,
          });
        } else {
          await restoreSaveStates({
            saveStatesSelectors: [{ emulatorId, backup }],
          });

          await handleSyncSaveStates({
            emulatorId,
            behavior: SyncBehavior.FORCE_CLOUD,
          });
        }

        close();

        toast({
          title: `Restored Backup ${saveKind === "saves" ? "Saves" : "Save States"}`,
          description: `Successfully restored backup for ${emulatorName}.`,
        });
      } catch (e) {
        const error = e instanceof Error ? e : new Error("Unknown error");
        console.error("Failed to restore backup", error);

        toast({
          title: `Failed to Restore ${saveKind === "saves" ? "Saves" : "Save States"} Backup`,
          description: `An error occurred while restoring the backup: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setRestoring(null);
      }
    },
    [
      emulatorId,
      saveKind,
      restoreSaves,
      restoreSaveStates,
      close,
      emulatorName,
      handleSyncSaves,
      handleSyncSaveStates,
    ],
  );

  const sortedBackups = useMemo(
    () =>
      backups?.slice().sort((a, b) => {
        const timeA = a.createdAt ? timestampDate(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? timestampDate(b.createdAt).getTime() : 0;

        return timeB - timeA;
      }) ?? [],
    [backups],
  );

  const pending =
    saveKind === "saves"
      ? restoreSavesStatus === "pending"
      : restoreSaveStatesStatus === "pending";

  const error = saveKind === "saves" ? savesError : saveStatesError;
  const disabled = pending || error !== null;

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
              `Restore Cloud ${saveKind === "saves" ? "Saves" : "Save States"} Backup`}
          </DialogTitle>
          <DialogDescription className="max-w-[45ch]">
            {description ??
              `Select a backup to restore for emulator: ${emulatorName}`}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="text-destructive-text text-sm">
            Failed to restore: [{error.name}] - {error.message}
          </p>
        ) : null}

        {sortedBackups.map((backup) => (
          <Item key={backup.backupId} variant="outline">
            <ItemContent className="">
              {backup.createdAt
                ? timestampDate(backup.createdAt).toLocaleString()
                : "Unknown date"}
            </ItemContent>

            <ItemActions>
              <Button
                onClick={() => selectBackup(backup)}
                disabled={disabled}
                variant="accent"
                size="sm"
              >
                <RotateCcwIcon
                  className={cn(
                    restoring === backup.backupId && "animate-spin",
                  )}
                />
                Restore
              </Button>
            </ItemActions>
          </Item>
        ))}

        <DialogFooter>
          <Button
            disabled={disabled}
            type="button"
            variant="ghost"
            onClick={close}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
