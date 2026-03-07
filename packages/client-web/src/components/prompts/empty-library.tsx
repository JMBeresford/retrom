import { useGames } from "@/queries/useGames";
import { toast } from "@retrom/ui/components/toast";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

export function EmptyLibraryPrompt() {
  const { data: games } = useGames({ selectFn: ({ games }) => games });

  useEffect(() => {
    if (games?.length === 0) {
      toast({
        title: "Your Library Is Empty",
        id: "empty-library",
        duration: Infinity,
        description: "Have you added any games to your library yet?",
        action: (
          <Link
            to="."
            search={(prev) => ({ ...prev, updateLibraryModal: { open: true } })}
          >
            Update Library
          </Link>
        ),
      });
    }
  }, [games]);

  return <></>;
}
