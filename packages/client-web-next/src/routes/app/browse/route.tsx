import { Outlet, createFileRoute } from "@tanstack/react-router";
import { PlatformFormDialog } from "@/modals/platform-form-dialog/dialog";
import { IgdbSearchFormDialog } from "@/modals/igdb-search-dialog/dialog";
import { ConfirmDialog } from "@/modals/confirm-modal";
import { ImageSearchDialog } from "@/modals/image-search-dialog/dialog";

export const Route = createFileRoute("/app/browse")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />

      <ImageSearchDialog />
      <PlatformFormDialog />
      <IgdbSearchFormDialog />
      <ConfirmDialog />
    </>
  );
}
