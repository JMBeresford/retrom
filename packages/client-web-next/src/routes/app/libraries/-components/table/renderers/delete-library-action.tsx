import { Button } from "@retrom/ui-next/components/button";
import { Trash2 } from "lucide-react";
import { useDeleteLibrary } from "@/data/libraries/use-delete-library";

export function DeleteLibraryAction({ libraryId }: { libraryId: string }) {
  const { mutate: deleteLibrary } = useDeleteLibrary();

  return (
    <Button
      size="icon"
      variant="destructive"
      onClick={() => {
        deleteLibrary({ id: libraryId });
      }}
    >
      <Trash2 />
    </Button>
  );
}
