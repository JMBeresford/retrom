import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameDetail } from "./game-context";
import { useGameMetadata } from "@/queries/useGameMetadata";
import { cn, Image } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";

export function SimilarGames() {
  const { extraMetadata } = useGameDetail();

  const similarGames = extraMetadata?.similarGames?.value;
  const { data: similarGamesMetadata } = useGameMetadata({
    request: { gameIds: similarGames?.map((game) => game.id) },
    enabled: similarGames !== undefined,
    selectFn: (data) => data.metadata,
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Similar Games</CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollArea>
          <div className="flex gap-5">
            {similarGamesMetadata?.map((metadata) => (
              <Link
                key={metadata.gameId}
                href={`/game?gameId=${metadata.gameId}`}
              >
                <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
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
