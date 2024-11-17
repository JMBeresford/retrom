import { ActionButton } from "@/components/action-button";
import { FocusContainer } from "@/components/fullscreen/focus-container";
import { Scene } from "@/components/fullscreen/scene";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getFileStub } from "@/lib/utils";
import { GameDetailProvider, useGameDetail } from "@/providers/game-details";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { Background } from "./-components/background";
import { Name } from "./-components/name";
import { Description } from "./-components/description";
import { ExtraInfo } from "./-components/extra-info";
import { SimilarGames } from "./-components/similar-games";
import { GameActions } from "@/components/fullscreen/game-actions";
import { useRef } from "react";

export const Route = createLazyFileRoute(
  "/_fullscreenLayout/fullscreen/games/$gameId",
)({
  component: GameComponent,
});

function GameComponent() {
  const { gameId } = Route.useParams();

  const gameIdNumber = parseInt(gameId, 10);

  return (
    <GameDetailProvider gameId={gameIdNumber} errorRedirectUrl="/fullscreen">
      <Inner />
    </GameDetailProvider>
  );
}

function Inner() {
  const { gameMetadata, game } = useGameDetail();
  const navigate = useNavigate();
  const actionButton = useRef<HTMLButtonElement>(null);

  const name = gameMetadata?.name || getFileStub(game.path);

  return (
    <HotkeyLayer
      id="game-page"
      handlers={{
        BACK: {
          handler: () => navigate({ to: "/fullscreen", resetScroll: false }),
        },
      }}
    >
      <ScrollArea className="h-full w-full">
        <FocusContainer
          opts={{ focusKey: "game-details", forceFocus: true }}
          className="flex-grow flex justify-center items-center w-full animate-in fade-in"
        >
          <div className={cn("flex flex-col w-full h-full relative")}>
            <div
              className={cn(
                "relative min-h-full w-full",
                "grid grid-rows-[1fr_auto_auto_auto]",
                "*:col-start-1 *:col-end-1",
              )}
            >
              <div className="relative h-[75dvh] row-start-1 row-end-3 -z-[1] overflow-hidden">
                <Scene>
                  {gameMetadata && <Background metadata={gameMetadata} />}
                  <Name name={name} />
                </Scene>

                <div className="absolute inset-0 bg-gradient-to-t from-background to-20% to-background/0" />
              </div>

              <div className="row-start-2 row-end-4 flex justify-center gap-1">
                <div className="w-min">
                  <HotkeyLayer
                    id="action-button"
                    handlers={{
                      ACCEPT: { handler: () => actionButton.current?.click() },
                    }}
                  >
                    <ActionButton
                      ref={actionButton}
                      onFocus={(event) => {
                        event.target?.scrollIntoView({
                          block: "end",
                          behavior: "smooth",
                        });
                      }}
                      game={game}
                      className={cn(
                        "w-auto text-5xl h-[unset] *:first:hidden uppercase px-8 py-4",
                        "opacity-80 focus-hover:opacity-100 transition-all",
                      )}
                    />
                  </HotkeyLayer>
                </div>

                <GameActions />
              </div>

              <div className="row-start-4 my-8 flex flex-col gap-12 w-max max-w-[85ch] mx-auto items-stretch">
                <ExtraInfo />
                <Description description={gameMetadata?.description || ""} />
                <SimilarGames />
              </div>
            </div>
          </div>
        </FocusContainer>
      </ScrollArea>
    </HotkeyLayer>
  );
}
