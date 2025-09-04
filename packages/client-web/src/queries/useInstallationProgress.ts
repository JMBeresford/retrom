import { useInstallationProgressStore } from "@/providers/installation-progress";
import { useEffect, useState } from "react";

export function useInstallationProgress(gameId: number) {
  const store = useInstallationProgressStore();
  const lastUpdate = store.getState()[gameId]?.at(-1);
  const [progress, setProgress] = useState(lastUpdate?.percent ?? 0);

  useEffect(() => {
    const unsub = store.subscribe((s) => {
      const updates = s[gameId];
      const percent = updates?.at(-1)?.percent;
      if (percent !== undefined) {
        setProgress(percent);
      }
    });

    return unsub;
  }, [store, gameId]);

  return progress;
}
