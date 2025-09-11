import { useToast } from "@retrom/ui/hooks/use-toast";
import { useEffect } from "react";
import { useUpdateCheck } from "@/queries/useUpdateCheck";
import { useClientVersion } from "@/queries/useClientVersion";
import { useNavigate } from "@tanstack/react-router";

export function UpdateAvailable() {
  const { data: update, status: updateCheckStatus } = useUpdateCheck();
  const { data: clientVersion, status: clientVersionStatus } =
    useClientVersion();

  const pending =
    updateCheckStatus === "pending" || clientVersionStatus === "pending";

  if (update === null || pending || !clientVersion) {
    return null;
  }

  return update ? <InnerToast /> : null;
}

function InnerToast() {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { dismiss } = toast({
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

    return () => {
      dismiss();
    };
  }, [toast, navigate]);

  return <></>;
}
