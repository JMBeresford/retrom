import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@retrom/ui-next/components/separator";
import { Button } from "@retrom/ui-next/components/button";
import { LibraryTable } from "./-components/table";
import { LibraryFormDialog } from "./-components/library-form-dialog";
import { useModalAction } from "@/modals/use-modal-action";
import { FileExplorerDialog } from "@/modals/file-explorer";
import { ConfirmDialog } from "@/modals/confirm-modal";

export const Route = createFileRoute("/app/libraries")({
  component: RouteComponent,
});

function RouteComponent() {
  const libraryFormModal = useModalAction("libraryForm");

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <div className="flex gap-2 items-end">
          <h1 className="font-heading text-4xl font-bold">Libraries</h1>
          <Separator orientation="vertical" />
          <Button
            onClick={() => libraryFormModal.openModal({ action: "create" })}
          >
            Add Library
          </Button>
        </div>

        <p className="pretty max-w-prose text-muted-foreground">
          A library is a collection of games and platforms that can be organized
          and accessed through the Retrom application. You can add, edit, or
          delete libraries as needed.
        </p>

        <div className="mt-4">
          <LibraryTable />
        </div>
      </div>

      <LibraryFormDialog />
      <FileExplorerDialog />
      <ConfirmDialog />
    </>
  );
}
