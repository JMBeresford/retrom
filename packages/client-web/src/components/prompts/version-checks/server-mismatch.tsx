import { useServerInfo } from "@/queries/useServerInfo";
import { useClientVersion } from "@/queries/useClientVersion";
import { toast } from "@retrom/ui/hooks/use-toast";
import { useLayoutEffect } from "react";
import { isBreakingChange, versionCompare } from "@/lib/version-utils";
import { Link } from "@tanstack/react-router";

export function ServerMismatch() {
  const { data: serverVersion, status: serverStatus } = useServerInfo({
    selectFn: (data) => data.serverInfo?.version,
  });
  const { data: clientVersion, status: clientStatus } = useClientVersion();

  const pending = serverStatus === "pending" || clientStatus === "pending";
  const error = serverStatus === "error" || clientStatus === "error";

  useLayoutEffect(() => {
    if (pending || error || !serverVersion || !clientVersion) {
      return;
    }

    const comparison = versionCompare(serverVersion, clientVersion);
    const breaking = isBreakingChange(serverVersion, clientVersion);

    const title = breaking
      ? "Incompatible Server Version"
      : "Server Version Mismatch";

    const variant = breaking ? "destructive" : "default";

    const description = breaking
      ? "You may experience issues until the version mismatch is resolved."
      : "The server is running a different version of Retrom.";

    if (comparison === 0) {
      return;
    }

    toast({
      title,
      variant,
      description,
      duration: Infinity,
      action: (
        <Link to="." search={{ versionInfoModal: { open: true } }}>
          Resolve
        </Link>
      ),
    });
  }, [clientVersion, serverVersion, error, pending]);

  return null;
}
