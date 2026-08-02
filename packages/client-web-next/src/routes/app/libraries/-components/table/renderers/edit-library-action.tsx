import { Button } from "@retrom/ui-next/components/button";
import { Edit2 } from "lucide-react";

export function EditLibraryAction({ libraryId }: { libraryId: string }) {
  return (
    <Button size="icon" variant="secondary">
      <Edit2 />
    </Button>
  );
}
