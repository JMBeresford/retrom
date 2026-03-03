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

export function LaunchConfig() {
  const { emulator, defaultProfile } = useGameDetail();
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
            !!emulator
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
                        <span>{data.backups.length} backups available</span>
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
            !!emulator
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
                        <span>{data.backups.length} backups available</span>
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
