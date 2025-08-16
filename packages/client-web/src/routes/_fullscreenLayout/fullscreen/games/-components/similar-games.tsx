import {
  FocusableElement,
  FocusContainer,
  useFocusable,
} from "@/components/fullscreen/focus-container";
import { ScrollArea, ScrollBar } from "@retrom/ui/components/scroll-area";
import { cn } from "@retrom/ui/lib/utils";
import { useGameDetail } from "@/providers/game-details";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useGameMetadata } from "@/queries/useGameMetadata";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";
import { RefObject, useMemo } from "react";
import { createUrl, usePublicUrl } from "@/utils/urls";
import { Skeleton } from "@retrom/ui/components/skeleton";

export function SimilarGames() {
  const { extraMetadata } = useGameDetail();

  const similarGames = extraMetadata?.similarGames?.value;

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
          ) : !similarGames?.length ? (
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
            similarGames
              .slice(0, 20)
              .map(({ id }) => <SimilarGame key={id} gameId={id} />)
          )}
        </FocusContainer>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function SimilarGame(props: { gameId: number }) {
  const publicUrl = usePublicUrl();
  const { data, status } = useGameMetadata({
    request: { gameIds: [props.gameId] },
    selectFn: (data) => ({
      metadata: data.metadata.at(0),
      mediaPaths:
        props.gameId in data.mediaPaths
          ? data.mediaPaths[props.gameId]
          : undefined,
    }),
  });

  const navigate = useNavigate();
  const { ref } = useFocusable<HTMLDivElement>({
    focusKey: `similar-game-${props.gameId}`,
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
    navigate({
      to: "/fullscreen/games/$gameId",
      resetScroll: false,
      params: { gameId: props.gameId.toString() },
    }).catch(console.error);
  };

  const coverUrl = useMemo(() => {
    const localPath = data?.mediaPaths?.coverUrl;
    if (localPath && publicUrl) {
      return createUrl({ path: localPath, base: publicUrl })?.href;
    }

    return data?.metadata?.coverUrl;
  }, [publicUrl, data]);

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
        {status !== "pending" ? (
          coverUrl ? (
            <img src={coverUrl} alt="" />
          ) : null
        ) : (
          <Skeleton className="border aspect-[3/4]" />
        )}
      </div>
    </HotkeyLayer>
  );
}
