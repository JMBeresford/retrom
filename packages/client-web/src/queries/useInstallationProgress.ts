import { useInstallationProgressStore } from "@/providers/installation-progress";
import { create } from "@bufbuild/protobuf";
import { InstallationMetricsSchema } from "@retrom/codegen/retrom/client/installation_pb";
import { useEffect, useState } from "react";

export function useInstallationProgress(gameId: number) {
  const store = useInstallationProgressStore();
  const lastUpdate = store.getState()[gameId]?.at(-1);

  const [progress, setProgress] = useState(
    create(InstallationMetricsSchema, lastUpdate?.metrics),
  );

  useEffect(() => {
    const unsub = store.subscribe((s) => {
      const updates = s[gameId];
      const metrics = updates?.at(-1)?.metrics;

      if (metrics !== undefined) {
        setProgress(metrics);
      }
    });

    return unsub;
  }, [store, gameId]);

  return progress;
}
