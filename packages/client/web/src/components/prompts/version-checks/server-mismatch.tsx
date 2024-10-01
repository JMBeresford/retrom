import { useServerInfo } from "@/queries/useServerInfo";
import { useClientVersion } from "@/queries/useClientVersion";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { isBreakingChange, versionCompare } from "@/lib/version-utils";
import { ToastAction } from "@/components/ui/toast";
import { Link } from "@tanstack/react-router";

export function ServerMismatch() {
  const { data: serverVersion, status: serverStatus } = useServerInfo({
    selectFn: (data) => data.serverInfo?.version,
  });
  const { data: clientVersion, status: clientStatus } = useClientVersion();

  const pending = serverStatus === "pending" || clientStatus === "pending";
  const error = serverStatus === "error" || clientStatus === "error";

  if (pending || error || !serverVersion || !clientVersion) {
    return null;
  }

  const comparison = versionCompare(serverVersion, clientVersion);
  const breaking = isBreakingChange(serverVersion, clientVersion);

  return comparison !== 0 ? <InnerToast breaking={breaking} /> : <></>;
}

function InnerToast(props: { breaking: boolean }) {
  const { toast } = useToast();

  useEffect(() => {
    const title = props.breaking
      ? "Incompatible Server Version"
      : "Server Version Mismatch";

    const variant = props.breaking ? "destructive" : "default";

    const description = props.breaking
      ? "You may experience issues until the version mismatch is resolved."
      : "The server is running a different version of Retrom.";

    const toastInfo = toast({
      title,
      variant,
      description,
      duration: Infinity,
      action: (
        <ToastAction altText="show version resolution dialog" asChild>
          <Link search={{ versionInfoModal: { open: true } }}>Resolve</Link>
        </ToastAction>
      ),
    });

    const dismiss = toastInfo.dismiss;

    return () => {
      if (dismiss) {
        dismiss();
      }
    };
  }, [toast, props.breaking]);

  return <></>;
}
