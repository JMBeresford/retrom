import { toast } from "@retrom/ui/hooks/use-toast";
import { useLayoutEffect } from "react";
import { useUpdateCheck } from "@/queries/useUpdateCheck";
import { useClientVersion } from "@/queries/useClientVersion";
import { useNavigate } from "@tanstack/react-router";

export function UpdateAvailable() {
  const { data: update, status: updateCheckStatus } = useUpdateCheck();
  const navigate = useNavigate();

  const { data: clientVersion, status: clientVersionStatus } =
    useClientVersion();

  useLayoutEffect(() => {
    const pending =
      updateCheckStatus === "pending" || clientVersionStatus === "pending";

    if (update === null || pending || !clientVersion) {
      return;
    }

    toast({
      title: "Update Available",
      duration: Infinity,
      description: "A new version of Retrom is available.",
      action: {
        label: "Update",
        onClick: () => {
          navigate({
            to: ".",
            search: (prev) => ({
              ...prev,
              checkForUpdateModal: { open: true },
            }),
          }).catch(console.error);
        },
      },
    });
  }, [navigate, clientVersion, update, updateCheckStatus, clientVersionStatus]);

  return null;
}
