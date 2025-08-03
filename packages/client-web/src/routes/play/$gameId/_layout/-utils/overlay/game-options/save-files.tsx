import { MenuEntryButton } from "@/components/fullscreen/menubar/menu-entry-button";
import { timestampToDate } from "@/lib/utils";
import { useEJSSessionState } from "@/providers/emulator-js/ejs-session";
import { useGameDetail } from "@/providers/game-details";
import { useStatSaveFiles } from "@/queries/saveFiles";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";
import { OverlayMenuItem } from "..";
import { FilesystemNodeType } from "@retrom/codegen/retrom/file-explorer_pb";
import { readableByteSize } from "@/utils/files";
import { DateTime } from "luxon";
import { useRestoreSaveFromBackup } from "@/mutations/saveFiles";
import { useQueryClient } from "@tanstack/react-query";
import {
  BackupStats,
  SaveFilesStat,
} from "@retrom/codegen/retrom/services/saves-service_pb";
import { toast } from "@retrom/ui/hooks/use-toast";

function useStats() {
  const {
    game: { id: gameId },
    emulator,
  } = useGameDetail();

  return useStatSaveFiles({
    saveFilesSelectors: [{ gameId, emulatorId: emulator?.id }],
    config: { includeBackups: true },
  });
}

const SaveFileInfoRender = forwardRef<HTMLButtonElement>((props, ref) => {
  const { data, status } = useStats();

  if (status === "pending") {
    return (
      <MenuEntryButton disabled>
        <LoaderCircle className="animate-spin" /> Fetching save files...
      </MenuEntryButton>
    );
  } else if (status === "error") {
    return (
      <MenuEntryButton disabled>
        <AlertCircle className="text-destructive-text" />
        Error fetching save files
      </MenuEntryButton>
    );
  }

  const save = data.saveFilesStats.at(0);

  if (!save) {
    return <MenuEntryButton disabled>No cloud saves found</MenuEntryButton>;
  }

  const savedAt = save.createdAt
    ? timestampToDate(save.createdAt).toLocaleString()
    : undefined;

  return (
    <MenuEntryButton {...props} ref={ref} label={savedAt}>
      Cloud Save Info
    </MenuEntryButton>
  );
});

function GeneralSaveInfo() {
  const { data } = useStats();

  const save = data?.saveFilesStats.at(0);
  if (!save) {
    return "No information available";
  }

  const { createdAt, backups, fileStats } = save;
  const files = fileStats.filter(
    (stat) => stat.nodeType === FilesystemNodeType.FILE,
  );

  return (
    <>
      <MenuEntryButton
        handlers={{ ACCEPT: { actionBar: { label: undefined } } }}
        size="sm"
        label={createdAt ? timestampToDate(createdAt).toLocaleString() : "N/A"}
      >
        Created At
      </MenuEntryButton>

      <MenuEntryButton
        size="sm"
        label={files.length}
        handlers={{ ACCEPT: { actionBar: { label: undefined } } }}
      >
        Files
      </MenuEntryButton>

      <MenuEntryButton
        handlers={{ ACCEPT: { actionBar: { label: undefined } } }}
        size="sm"
        label={
          fileStats.length
            ? readableByteSize(
                fileStats.reduce(
                  (acc, stat) => acc + (stat.byteSize ?? 0n),
                  0n,
                ),
              )
            : "N/A"
        }
      >
        Total Size
      </MenuEntryButton>

      <MenuEntryButton
        size="sm"
        label={backups.length}
        handlers={{ ACCEPT: { actionBar: { label: undefined } } }}
      >
        Backups Available
      </MenuEntryButton>
    </>
  );
}

function SaveFilesList() {
  const { data } = useStats();
  const save = data?.saveFilesStats.at(0);

  return save?.fileStats
    .filter((stat) => stat.nodeType === FilesystemNodeType.FILE)
    .map((fileStat) => {
      const size = fileStat.byteSize
        ? readableByteSize(fileStat.byteSize)
        : "Unknown Size";

      return (
        <MenuEntryButton
          size="sm"
          key={fileStat.path}
          label={size}
          handlers={{ ACCEPT: { actionBar: { label: undefined } } }}
        >
          {fileStat.path}
        </MenuEntryButton>
      );
    });
}

export const saveFileInfo: OverlayMenuItem = {
  label: "Cloud Save Info",
  Render: SaveFileInfoRender,
  items: [
    { label: "General Info", groupItems: [{ Render: GeneralSaveInfo }] },
    { label: "Files", groupItems: [{ Render: SaveFilesList }] },
  ],
};

function SyncToCloudRender() {
  const { saveSaveFile } = useEJSSessionState();

  return (
    <MenuEntryButton onClick={saveSaveFile} label="Upload current save file">
      Sync Save to Cloud
    </MenuEntryButton>
  );
}

export const syncToCloud: OverlayMenuItem = {
  Render: SyncToCloudRender,
};

const BackupsRender = forwardRef<HTMLButtonElement>((props, ref) => {
  const { data, status } = useStats();

  if (status === "pending") {
    return (
      <MenuEntryButton disabled>
        <LoaderCircle className="animate-spin" /> Fetching backups...
      </MenuEntryButton>
    );
  }

  if (status === "error") {
    return (
      <MenuEntryButton disabled>
        <AlertCircle className="text-destructive-text" />
        Error fetching backups
      </MenuEntryButton>
    );
  }

  const backups = data.saveFilesStats.at(0)?.backups ?? [];

  return (
    <MenuEntryButton
      ref={ref}
      {...props}
      label={`${backups.length} available`}
      disabled={!backups.length}
    >
      Cloud Save Backups
    </MenuEntryButton>
  );
});

function BackupsList() {
  const { data } = useStats();

  const save = data?.saveFilesStats.at(0);
  if (!save) {
    return null;
  }

  const backups = save.backups ?? [];
  backups.sort((a, b) => {
    const dateA = a.createdAt ? timestampToDate(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? timestampToDate(b.createdAt) : new Date(0);

    return dateB.getTime() - dateA.getTime();
  });

  return backups.map((backup, idx) => (
    <BackupItem save={save} backup={backup} key={idx} />
  ));
}

function BackupItem(props: { save: SaveFilesStat; backup: BackupStats }) {
  const { backup, save } = props;
  const [confirm, setConfirm] = useState(false);
  const createdAt = backup.createdAt
    ? DateTime.fromJSDate(timestampToDate(backup.createdAt)).toLocaleString(
        DateTime.DATETIME_MED_WITH_WEEKDAY,
      )
    : "Unknown backup";

  const fileCount = backup.backupFileStats.length;
  const size = backup.backupFileStats.reduce(
    (acc, stat) => acc + (stat.byteSize ?? 0n),
    0n,
  );

  const queryClient = useQueryClient();
  const { loadSaveFiles, restart } = useEJSSessionState();
  const { mutateAsync: restore } = useRestoreSaveFromBackup();

  const handler = useCallback(async () => {
    if (confirm) {
      const { dismiss, update } = toast({
        title: "Restoring Backup",
        description: <LoaderCircle className="animate-spin" />,
      });

      try {
        const res = await restore({
          saveFilesSelectors: [
            {
              gameId: save.gameId,
              emulatorId: save?.emulatorId,
              backup,
            },
          ],
        });

        await queryClient.invalidateQueries({
          predicate: ({ queryKey }) => queryKey.includes("getSaveFiles"),
        });

        const saveFiles = res.saveFiles.at(0);
        if (saveFiles) {
          loadSaveFiles(saveFiles);
          restart();
        }

        update({
          description: "Backup restored successfully",
        });
      } catch (error) {
        dismiss();
        toast({
          title: "Failed to restore backup",
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      } finally {
        setConfirm(false);
      }
    } else {
      setConfirm(true);
    }
  }, [confirm, backup, save, loadSaveFiles, queryClient, restore, restart]);

  return (
    <MenuEntryButton
      onBlur={() => setConfirm(false)}
      handlers={{
        ACCEPT: {
          actionBar: { label: "Restore Backup" },
          handler,
        },
      }}
      label={
        confirm
          ? "This will overwrite your current save file"
          : `${fileCount} files - ${readableByteSize(size)}`
      }
    >
      {confirm ? (
        <span className="text-destructive-text"> Are you sure?</span>
      ) : (
        createdAt
      )}
    </MenuEntryButton>
  );
}

export const backups: OverlayMenuItem = {
  label: "Cloud Save Backups",
  Render: BackupsRender,
  items: [{ label: "Backups", groupItems: [{ Render: BackupsList }] }],
};
