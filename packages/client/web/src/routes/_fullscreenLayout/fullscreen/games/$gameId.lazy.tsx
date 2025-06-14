import {
  FocusContainer,
  useFocusable,
} from "@/components/fullscreen/focus-container";
import { Scene } from "@/components/fullscreen/scene";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getFileStub } from "@/lib/utils";
import { GameDetailProvider, useGameDetail } from "@/providers/game-details";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import {
  CatchBoundary,
  createLazyFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { Background } from "./-components/background";
import { Description } from "./-components/description";
import { ExtraInfo } from "./-components/extra-info";
import { SimilarGames } from "./-components/similar-games";
import { GameActions } from "@/components/fullscreen/game-actions";
import { FocusEvent, memo } from "react";
import { PlatformDependent } from "@/lib/env";
import { DownloadGameButton } from "@/components/action-button/download-game-button";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { PlayGameButton } from "@/components/action-button/play-game-button";
import { InstallGameButton } from "@/components/action-button/install-game-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Name } from "./-components/name";
import { InstallationStatus } from "@retrom/codegen/retrom/client/client-utils_pb";
import { Emulator_OperatingSystem } from "@retrom/codegen/retrom/models/emulators_pb";
import { PlayIcon } from "lucide-react";

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
  buttonVariants({ variant: "accent", size: "lg" }),
  "font-bold w-auto text-5xl h-[unset] [&_svg]:hidden uppercase px-8 py-4",
  "focus:ring-2 focus:ring-ring focus:ring-offset-2",
  "opacity-80 focus-hover:opacity-100 transition-all h-full rounded-none",
);

function onFocus(e: FocusEvent<HTMLButtonElement>) {
  e.target.scrollIntoView({ block: "end" });
}

function Inner() {
  const { gameMetadata, game, emulator } = useGameDetail();
  const { data: installationStatus } = useInstallationQuery(game);
  const navigate = useNavigate();

  const name = gameMetadata?.name || getFileStub(game.path);
  const url = gameMetadata?.backgroundUrl || gameMetadata?.coverUrl;

  const playableInWeb =
    emulator?.libretroName &&
    emulator.operatingSystems.includes(Emulator_OperatingSystem.WASM);

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
                  onCatch={(error) => console.error("MAGOO", error)}
                  errorComponent={() => (
                    <div className="absolute inset-0 grid place-items-center">
                      <img src={url} className=""></img>
                    </div>
                  )}
                >
                  <Scene>
                    {gameMetadata && <Background metadata={gameMetadata} />}
                    <Name name={name} />
                  </Scene>
                </CatchBoundary>

                <div className="absolute inset-0 bg-gradient-to-t from-background to-20% to-background/0" />
              </div>

              <div className="row-start-2 row-end-4 flex justify-center gap-1">
                <div className="w-min">
                  <PlatformDependent
                    desktop={
                      installationStatus === InstallationStatus.INSTALLED ? (
                        <PlayButton />
                      ) : (
                        <InstallButton />
                      )
                    }
                    web={
                      playableInWeb ? <PlayInWebButton /> : <DownloadButton />
                    }
                  />
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

function PlayInWebButton() {
  const { game } = useGameDetail();
  const navigate = useNavigate();

  const { ref } = useFocusable<HTMLButtonElement>({
    initialFocus: true,
    focusKey: "fullscreen-play-web-button",
    onFocus: ({ node }) => {
      node?.focus({ preventScroll: true });
    },
  });

  return (
    <HotkeyLayer
      id="play-web-button"
      handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
    >
      <Button
        ref={ref}
        onClick={() =>
          navigate({
            to: "/play/$gameId",
            params: { gameId: game.id.toString() },
          })
        }
        variant="accent"
        className={cn(buttonStyles)}
      >
        <PlayIcon className="h-[1.2rem] w-[1.2rem] fill-current" />
        Play
      </Button>
    </HotkeyLayer>
  );
}

const PlayButton = memo(() => {
  const { ref } = useFocusable<HTMLButtonElement>({
    focusKey: "fullscreen-play-button",
    initialFocus: true,
    onFocus: ({ node }) => {
      node?.focus({ preventScroll: true });
    },
  });

  return (
    <HotkeyLayer
      id="play-button"
      handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
    >
      <PlayGameButton ref={ref} onFocus={onFocus} className={buttonStyles} />
    </HotkeyLayer>
  );
});

const InstallButton = memo(() => {
  const { ref } = useFocusable<HTMLButtonElement>({
    focusKey: "fullscreen-install-button",
    initialFocus: true,
    onFocus: ({ node }) => {
      node?.focus({ preventScroll: true });
    },
  });

  return (
    <HotkeyLayer
      id="install-button"
      handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
    >
      <InstallGameButton
        ref={ref}
        onFocus={onFocus}
        className={cn(
          buttonStyles,
          '[&_div[role="progressbar"]]:w-[6ch] [&_div[role="progressbar"]_>_*]:bg-primary-foreground',
        )}
      />
    </HotkeyLayer>
  );
});

function DownloadButton() {
  const { game } = useGameDetail();
  const { ref } = useFocusable<HTMLButtonElement>({
    focusKey: "fullscreen-download-button",
    initialFocus: true,
    onFocus: ({ node }) => {
      node?.focus({ preventScroll: true });
    },
  });

  return (
    <HotkeyLayer
      id="download-button"
      handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
    >
      <DownloadGameButton
        ref={ref}
        onFocus={onFocus}
        game={game}
        className={buttonStyles}
      />
    </HotkeyLayer>
  );
}
