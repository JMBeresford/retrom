import { Skeleton } from "@retrom/ui-next/components/skeleton";
import { cn } from "@retrom/ui-next/lib/utils";
import { useLauncherContext } from "./launcher-context";
import type { HTMLAttributes, ReactNode } from "react";
import { useListGameFiles } from "@/data/libraries/use-list-game-files";
import { readableByteSize } from "@/common/files";
import { useStatSaveFiles } from "@/data/saves/use-stat-save-files";
import { useStatSaveStates } from "@/data/saves/use-stat-save-states";

export type FilesProps = {} & HTMLAttributes<HTMLDivElement>;

export function Files({ className, ...props }: FilesProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-around flex-wrap gap-4 w-full",
        "*:basis-1/4",
        className,
      )}
      {...props}
    >
      <GameFiles />
      <SaveFiles />
      <SaveStates />
    </div>
  );
}

function GameFiles() {
  const [launcherState] = useLauncherContext();

  const gameFilesQuery = useListGameFiles({
    request: {
      gameIds: [launcherState.gameId],
    },
    options: {
      select: (response) => response.gameFiles,
    },
  });

  if (gameFilesQuery.isError) {
    return <p className="text-destructive">Error loading files.</p>;
  }

  if (gameFilesQuery.isPending) {
    return <Skeleton className="h-full w-full" />;
  }

  const bytes = gameFilesQuery.data.reduce(
    (acc, curr) => acc + curr.byteSize,
    0n,
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <FileItem label="Total Size" value={readableByteSize(bytes)} />
      <FileItem
        label="File Count"
        value={`${gameFilesQuery.data.length} file(s)`}
      />
    </div>
  );
}

function SaveFiles() {
  const [launcherState] = useLauncherContext();

  const saveFilesQuery = useStatSaveFiles({
    request: {
      saveFilesSelectors: [{ emulatorId: launcherState.emulatorId }],
    },
    options: {
      enabled: !!launcherState.emulatorId,
      select: (response) => response.saveFilesStats,
    },
  });

  if (!launcherState.emulatorId) {
    return (
      <div className="flex flex-col items-center gap-2">
        <FileItem
          label="Saves Size"
          value={<span className="italic">No emulator selected</span>}
          className="opacity-50"
        />
        <FileItem
          label="Saves Backups"
          value={<span className="italic">No emulator selected</span>}
          className="opacity-50"
        />
      </div>
    );
  }

  if (saveFilesQuery.isError) {
    return <p className="text-destructive">Error loading save files.</p>;
  }

  if (saveFilesQuery.isPending) {
    return <Skeleton className="h-full w-full" />;
  }

  const stats = saveFilesQuery.data.at(0)?.fileStats ?? [];
  const bytes = stats.reduce((acc, curr) => acc + (curr.byteSize ?? 0n), 0n);

  const backups = saveFilesQuery.data.at(0)?.backups ?? [];

  return (
    <div className="flex flex-col items-center gap-2">
      <FileItem label="Saves Size" value={readableByteSize(bytes)} />
      <FileItem label="Saves Backups" value={`${backups.length} backup(s)`} />
    </div>
  );
}

function SaveStates() {
  const [launcherState] = useLauncherContext();

  const saveStatesQuery = useStatSaveStates({
    request: {
      saveStatesSelectors: [{ emulatorId: launcherState.emulatorId }],
    },
    options: {
      enabled: !!launcherState.emulatorId,
      select: (response) => response.saveStatesStats,
    },
  });

  if (!launcherState.emulatorId) {
    return (
      <div className="flex flex-col items-center gap-2">
        <FileItem
          label="States Size"
          value={<span className="italic">No emulator selected</span>}
          className="opacity-50"
        />
        <FileItem
          label="States Backups"
          value={<span className="italic">No emulator selected</span>}
          className="opacity-50"
        />
      </div>
    );
  }

  if (saveStatesQuery.isError) {
    return <p className="text-destructive">Error loading save files.</p>;
  }

  if (saveStatesQuery.isPending) {
    return <Skeleton className="h-full w-full" />;
  }

  const stats = saveStatesQuery.data.at(0)?.fileStats ?? [];
  const bytes = stats.reduce((acc, curr) => acc + (curr.byteSize ?? 0n), 0n);

  const backups = saveStatesQuery.data.at(0)?.backups ?? [];

  return (
    <div className="flex flex-col items-center gap-2">
      <FileItem label="States Size" value={readableByteSize(bytes)} />
      <FileItem label="States Backups" value={`${backups.length} backup(s)`} />
    </div>
  );
}

type FileItemValue = {
  label: ReactNode;
  value: ReactNode;
  className?: string;
};

function FileItem({ label, value, className }: FileItemValue) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <h3 className="font-heading text-lg font-semibold">{label}</h3>
      <p className="text-muted-foreground text-sm">{value}</p>
    </div>
  );
}
