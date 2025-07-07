import {
  FocusableElement,
  FocusContainer,
  useFocusable,
} from "@/components/fullscreen/focus-container";
import { ScrollArea, ScrollBar } from "@retrom/ui/components/scroll-area";
import { GameMetadata } from "@retrom/codegen/retrom/models/metadata_pb";
import { cn } from "@retrom/ui/lib/utils";
import { useGameDetail } from "@/providers/game-details";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useGameMetadata } from "@/queries/useGameMetadata";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";
import { RefObject } from "react";

export function SimilarGames() {
  const { extraMetadata } = useGameDetail();

  const similarGames = extraMetadata?.similarGames?.value;
  const { data, status } = useGameMetadata({
    request: { gameIds: similarGames?.map((game) => game.id) },
  });

  return (
    <div
      className={cn(
        "w-full bg-transparent border-l border-secondary pt-2",
        "focus-within:bg-muted/80 focus-within:border-accent",
        "hover:bg-muted/80 hover:border-accent transition-all",
      )}
    >
      <h3 className="text-3xl uppercase font-black ml-4">Similar Games</h3>

      <ScrollArea className="w-full">
        <FocusContainer
          opts={{
            focusKey: "similar-games",
          }}
          className={cn(
            "flex gap-2 p-4",
            "[&_p]:text-muted-foreground [&_p]:my-6 [&_p]:flex [&_p]:gap-2 [&_p]:mx-auto",
          )}
        >
          {status === "pending" ? (
            <p className="text-muted-foreground">
              <LoaderCircleIcon className="animate-spin" />
              Loading similar games...
            </p>
          ) : status === "error" ? (
            <p className="text-muted-foreground">
              <AlertCircleIcon className="text-destructive-text" />
              Error loading similar games
            </p>
          ) : data.metadata.length === 0 ? (
            <FocusableElement
              opts={{
                focusKey: `empty-similar-games`,
                onFocus: ({ node }) => {
                  node?.focus({ preventScroll: true });
                  node?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                  });
                },
              }}
              render={(ref: RefObject<HTMLParagraphElement>) => (
                <p ref={ref} tabIndex={-1} className="outline-none">
                  No similar games found for this game.
                </p>
              )}
            />
          ) : (
            data.metadata
              .slice(0, 20)
              .map((metadata) => (
                <SimilarGame key={metadata.gameId} metadata={metadata} />
              ))
          )}
        </FocusContainer>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function SimilarGame(props: { metadata: GameMetadata }) {
  const { metadata } = props;
  const navigate = useNavigate();
  const { ref } = useFocusable<HTMLDivElement>({
    focusKey: `similar-game-${metadata.gameId}`,
    onFocus: ({ node }) => {
      node?.focus({ preventScroll: true });
      node?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    },
  });

  const goToGame = () => {
    void navigate({
      to: "/fullscreen/games/$gameId",
      resetScroll: false,
      params: { gameId: metadata.gameId.toString() },
    });
  };

  return (
    <HotkeyLayer handlers={{ ACCEPT: { handler: () => goToGame() } }}>
      <div
        ref={ref}
        tabIndex={-1}
        className={cn(
          "focus:ring-2 focus:ring-offset-2 focus:ring-offset-ring focus:ring-ring min-w-[150px] max-w-[200px]",
          "outline-none scale-95 transition-all duration-200 focus-hover:scale-100 cursor-pointer",
        )}
        onClick={() => goToGame()}
      >
        <img src={metadata.coverUrl} alt="" />
      </div>
    </HotkeyLayer>
  );
}
