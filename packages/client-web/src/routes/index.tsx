import { Image } from "@/lib/utils";
import { cn } from "@retrom/ui/lib/utils";
import banner from "@/assets/img/LogoLong-NoBackground.png";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useConfigStore } from "@/providers/config";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div
        className={cn(
          "w-dvw h-dvh grid place-items-center",
          "bg-gradient-to-t from-background to-accent/10",
        )}
      >
        <Image
          className="max-w-[70dvh] max-h-[70dvh] animate-pulse"
          src={banner}
        />
      </div>
      <HandleLayoutRedirect />
    </>
  );
}

function HandleLayoutRedirect() {
  const fullscreenByDefault =
    useConfigStore().getState().config?.interface?.fullscreenByDefault;

  return (
    <>
      {fullscreenByDefault ? (
        <Navigate to="/fullscreen" replace={true} />
      ) : (
        <Navigate to="/home" replace={true} />
      )}
    </>
  );
}
