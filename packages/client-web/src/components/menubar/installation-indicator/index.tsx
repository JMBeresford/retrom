import { useInstallationIndex } from "@/providers/installation-index";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";
import { Button } from "@retrom/ui/components/button";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

export function InstallationIndicator() {
  const { installations } = useInstallationIndex();

  const installing = useMemo(
    () =>
      Object.entries(installations).filter(
        ([_, s]) => s === InstallationStatus.INSTALLING,
      ),
    [installations],
  );

  return (
    <Button variant="link" asChild>
      <Link to="/installing" className="text-muted-foreground py-1 text-sm">
        {installing.length} games installing
      </Link>
    </Button>
  );
}
