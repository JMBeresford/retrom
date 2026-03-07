import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@retrom/ui/components/card";
import { useGameDetail } from "@/providers/game-details";
import { InfoItem } from "./general-info";
import { Separator } from "@retrom/ui/components/separator";
import { Button } from "@retrom/ui/components/button";
import { Link } from "@tanstack/react-router";
import { match } from "ts-pattern";
import { useEmulatorSaveFilesStat } from "@/queries/useEmulatorSaveFilesStat";
import { useEmulatorSaveStatesStat } from "@/queries/useEmulatorSaveStatesStat";
import { readableByteSize } from "@/utils/files";
import { useModalAction } from "@/providers/modal-action";
import { useLocalEmulatorConfigs } from "@/queries/useLocalEmulatorConfigs";
import { useConfig } from "@/providers/config";

export function LaunchConfig() {
  const { emulator, defaultProfile } = useGameDetail();
  const { openModal } = useModalAction("restoreCloudSaves");
  const clientId = useConfig((store) => store.config?.clientInfo?.id);

  const { data: localConfig } = useLocalEmulatorConfigs({
    enabled: !!emulator && clientId !== undefined,
    request: {
      emulatorIds: emulator ? [emulator.id] : [],
      clientId,
    },
    selectFn: (data) =>
      data.configs.find((config) => config.emulatorId === emulator?.id) ?? null,
  });

  const saveFilesStatQuery = useEmulatorSaveFilesStat(
    {
      saveFilesSelectors: emulator ? [{ emulatorId: emulator.id }] : [],
      config: { includeBackups: true },
    },
    {
      enabled: !!emulator,
      select: (data) =>
        data.saveFilesStats.find((stat) => stat.emulatorId === emulator?.id) ??
        null,
    },
  );

  const saveStatesStatQuery = useEmulatorSaveStatesStat(
    {
      saveStatesSelectors: emulator ? [{ emulatorId: emulator.id }] : [],
      config: { includeBackups: true },
    },
    {
      enabled: !!emulator,
      select: (data) =>
        data.saveStatesStats.find((stat) => stat.emulatorId === emulator?.id) ??
        null,
    },
  );

  return (
    <Card className="py-0">
      <CardHeader>
        <CardTitle>Emulator Info</CardTitle>
      </CardHeader>

      <CardContent className="pb-4">
        <InfoItem
          title="Name"
          value={
            emulator?.name ?? (
              <span className="italic">No valid emulator found...</span>
            )
          }
        />

        <InfoItem
          title="Profile"
          value={
            defaultProfile?.name ?? (
              <span className="italic">No profile selected...</span>
            )
          }
        />

        <InfoItem
          title="Save File Info"
          value={
            !!emulator && !!localConfig?.saveDataPath
              ? match(saveFilesStatQuery)
                  .with({ status: "success" }, ({ data }) => {
                    if (!data) {
                      return "No save files found";
                    }

                    const totalSize = data.fileStats.reduce(
                      (acc, stat) => acc + (stat.byteSize ?? 0n),
                      0n,
                    );

                    const size = readableByteSize(totalSize);

                    return (
                      <span className="flex flex-col">
                        <span>
                          {size} in {data.fileStats.length} files
                        </span>
                        <Button
                          variant="inline"
                          onClick={() =>
                            openModal({
                              emulatorId: emulator.id,
                              emulatorName: emulator.name,
                              backups: data.backups,
                              saveKind: "saves",
                            })
                          }
                          className="w-min p-0 inline h-min underline"
                        >
                          {data.backups.length} backups available
                        </Button>
                      </span>
                    );
                  })
                  .with({ status: "error" }, () => (
                    <span className="text-red-500">Error fetching status</span>
                  ))
                  .with({ status: "pending" }, () => (
                    <span className="italic animate-pulse">
                      Loading save data...
                    </span>
                  ))
                  .exhaustive()
              : "N/A"
          }
        />

        <InfoItem
          title="Save State Info"
          value={
            !!emulator && !!localConfig?.saveStatesPath
              ? match(saveStatesStatQuery)
                  .with({ status: "success" }, ({ data }) => {
                    if (!data) {
                      return "No save states found";
                    }

                    const totalSize = data.fileStats.reduce(
                      (acc, stat) => acc + (stat.byteSize ?? 0n),
                      0n,
                    );

                    const size = readableByteSize(totalSize);

                    return (
                      <span className="flex flex-col">
                        <span>
                          {size} in {data.fileStats.length} save states
                        </span>
                        <Button
                          variant="inline"
                          onClick={() =>
                            openModal({
                              emulatorId: emulator.id,
                              emulatorName: emulator.name,
                              backups: data.backups,
                              saveKind: "saveStates",
                            })
                          }
                          className="w-min p-0 inline h-min underline"
                        >
                          {data.backups.length} backups available
                        </Button>
                      </span>
                    );
                  })
                  .with({ status: "error" }, () => (
                    <span className="text-red-500">Error fetching status</span>
                  ))
                  .with({ status: "pending" }, () => (
                    <span className="italic animate-pulse">
                      Loading save state data...
                    </span>
                  ))
                  .exhaustive()
              : "N/A"
          }
        />

        <Separator className="my-4" />

        <Button variant="outline" className="w-full gap-2" asChild>
          <Link
            to="."
            search={(prev) => ({
              ...prev,
              defaultProfilesModal: { open: true },
            })}
          >
            Manage Defaults
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
