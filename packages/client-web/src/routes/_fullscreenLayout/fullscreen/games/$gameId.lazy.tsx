import { ActionButton as ActionButtonImpl } from "@/components/action-button";
import {
  FocusContainer,
  useFocusable,
} from "@/components/fullscreen/focus-container";
import { GameActions } from "@/components/fullscreen/game-actions";
import { Scene } from "@/components/fullscreen/scene";
import { getFileStub } from "@/lib/utils";
import { GameDetailProvider, useGameDetail } from "@/providers/game-details";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { buttonVariants } from "@retrom/ui/components/button";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import { cn } from "@retrom/ui/lib/utils";
import {
  CatchBoundary,
  createLazyFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { Background } from "./-components/background";
import { Description } from "./-components/description";
import { ExtraInfo } from "./-components/extra-info";
import { Name } from "./-components/name";
import { SimilarGames } from "./-components/similar-games";
import { useInstallationStatus } from "@/queries/useInstallationStatus";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";

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

const buttonStyles = cn(
  buttonVariants({ variant: "secondary", size: "lg" }),
  "font-bold w-auto text-5xl uppercase px-8 py-4 h-full rounded-none",
  "ring-ring focus-visible:ring-2 focus-visible:ring-offset-0",
  "opacity-80 focus-hover:opacity-100 transition-all",
  '[&_div[role="progressbar"]]:w-[6ch] [&_div[role="progressbar"]]:bg-primary-foreground',
  '[&_div[role="progressbar"]_>_*]:bg-accent',
);

function Inner() {
  const { gameMetadata, game } = useGameDetail();
  const navigate = useNavigate();

  const name = gameMetadata?.name || getFileStub(game.path);
  const url = gameMetadata?.backgroundUrl || gameMetadata?.coverUrl;

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
          opts={{
            focusKey: "game-details",
            forceFocus: true,
          }}
          className="flex-grow flex justify-center items-center w-full animate-in fade-in pb-32"
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
                <CatchBoundary
                  getResetKey={() => "resetBg"}
                  onCatch={(error) => console.error(error)}
                  errorComponent={() => (
                    <div className="absolute inset-0 grid place-items-center">
                      <img src={url} className=""></img>
                    </div>
                  )}
                >
                  <Scene>
                    <Background />
                    <Name name={name} />
                  </Scene>
                </CatchBoundary>

                <div className="absolute inset-0 bg-gradient-to-t from-background to-20% to-background/0" />
              </div>

              <div className="row-start-2 row-end-4 flex justify-center gap-1">
                <div className="w-min">
                  <ActionButton />
                </div>

                {!game.thirdParty && <GameActions />}
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

function ActionButton() {
  const { game } = useGameDetail();
  const installationStatus = useInstallationStatus(game.id);

  const { ref } = useFocusable<HTMLButtonElement>({
    initialFocus: true,
    focusKey: "fullscreen-action-button",
    onFocus: ({ node }) => {
      node?.focus({ preventScroll: true });
      node.scrollIntoView({ block: "end" });
    },
  });

  return (
    <HotkeyLayer
      id="fullscreen-action-button"
      handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
    >
      <ActionButtonImpl
        ref={ref}
        game={game}
        className={cn(
          buttonStyles,
          installationStatus !== InstallationStatus.INSTALLING &&
            "focus-visible:bg-accent",
        )}
      />
    </HotkeyLayer>
  );
}
