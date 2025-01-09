import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useUpdateCheck } from "@/queries/useUpdateCheck";
import { useClientVersion } from "@/queries/useClientVersion";
import { ToastAction } from "@/components/ui/toast";
import { useNavigate } from "@tanstack/react-router";

export function UpdateAvailable() {
  const { data: update, status: updateCheckStatus } = useUpdateCheck();
  const { data: clientVersion, status: clientVersionStatus } =
    useClientVersion();

  const pending =
    updateCheckStatus === "pending" || clientVersionStatus === "pending";

  if (!update?.available || pending || !clientVersion) {
    return null;
  }

  return update ? <InnerToast /> : null;
}

function InnerToast() {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const toastInfo = toast({
      title: "Update Available",
      duration: Infinity,
      description: "A new version of Retrom is available.",
      action: (
        <ToastAction asChild altText="show update dialog">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  checkForUpdateModal: { open: true },
                }),
              })
            }
          >
            Update
          </Button>
        </ToastAction>
      ),
    });

    const dismiss = toastInfo.dismiss;

    return () => {
      if (dismiss) {
        dismiss();
      }
    };
  }, [toast, navigate]);

  return <></>;
}
