import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameMetadata } from "@/queries/useGameMetadata";
import { cn, Image } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useGameDetail } from "@/providers/game-details";
import { Link } from "@tanstack/react-router";

export function SimilarGames() {
  const { extraMetadata } = useGameDetail();

  const similarGames = extraMetadata?.similarGames?.value;
  const { data: similarGamesMetadata } = useGameMetadata({
    request: { gameIds: similarGames?.map((game) => game.id) },
    enabled: similarGames !== undefined,
    selectFn: (data) => data.metadata,
  });

  if (!similarGamesMetadata?.length) {
    return null;
  }

  return (
    <Card className="col-span-6 row-span-3">
      <CardHeader>
        <CardTitle>Similar Games</CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollArea
          className={cn(
            "after:absolute after:inset-y-0 after:right-0 after:w-[120px]",
            "after:bg-gradient-to-l after:from-background after:to-transparent z-10",
            "after:pointer-events-none after:touch-none",
          )}
        >
          <div className="flex gap-5 pb-4 pr-[60px]">
            {similarGamesMetadata?.map((metadata) => (
              <Link
                key={metadata.gameId}
                to={"/games/$gameId"}
                params={{ gameId: metadata.gameId.toString() }}
              >
                <div className="aspect-[3/4] relative rounded-lg overflow-hidden min-w-[120px]">
                  <Image src={metadata.coverUrl} alt="" className="w-[150px]" />

                  <div
                    className={cn(
                      "opacity-0 hover:opacity-100 transition-opacity",
                      "absolute inset-0 bg-gradient-to-t from-muted",
                      "flex flex-col-reverse overflow-hidden p-2",
                      "text-pretty font-semibold",
                    )}
                  >
                    <h4>{metadata.name}</h4>
                  </div>
                </div>
              </Link>
            ))}

            {!similarGamesMetadata?.length && (
              <div className="text-center w-full">
                <h4 className="text-muted-foreground/50 font-medium text-2xl">
                  No similar games found.
                </h4>
              </div>
            )}
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
