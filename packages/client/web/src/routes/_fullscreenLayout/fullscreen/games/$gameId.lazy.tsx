import {
  FocusableElement,
  FocusContainer,
} from "@/components/fullscreen/focus-container";
import { Scene } from "@/components/fullscreen/scene";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getFileStub } from "@/lib/utils";
import { GameDetailProvider, useGameDetail } from "@/providers/game-details";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { Background } from "./-components/background";
import { Description } from "./-components/description";
import { ExtraInfo } from "./-components/extra-info";
import { SimilarGames } from "./-components/similar-games";
import { GameActions } from "@/components/fullscreen/game-actions";
import { FocusEvent, useRef } from "react";
import { checkIsDesktop } from "@/lib/env";
import { DownloadGameButton } from "@/components/action-button/download-game-button";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { InstallationStatus } from "@/generated/retrom/client/client-utils";
import { PlayGameButton } from "@/components/action-button/play-game-button";
import { InstallGameButton } from "@/components/action-button/install-game-button";
import { buttonVariants } from "@/components/ui/button";
import { Name } from "./-components/name";

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
  const { gameMetadata, game } = useGameDetail();
  const { data: installationStatus, status } = useInstallationQuery(game);
  const navigate = useNavigate();

  const name = gameMetadata?.name || getFileStub(game.path);

  if (status !== "success") {
    return null;
  }

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
                <Scene>
                  {gameMetadata && <Background metadata={gameMetadata} />}
                  <Name name={name} />
                </Scene>

                <div className="absolute inset-0 bg-gradient-to-t from-background to-20% to-background/0" />
              </div>

              <div className="row-start-2 row-end-4 flex justify-center gap-1">
                <div className="w-min">
                  {status === "success" ? (
                    installationStatus === InstallationStatus.INSTALLED ? (
                      <PlayButton />
                    ) : checkIsDesktop() ? (
                      <InstallButton />
                    ) : (
                      <DownloadButton />
                    )
                  ) : (
                    <></>
                  )}
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

function PlayButton() {
  const ref = useRef<HTMLButtonElement>(null!);

  return (
    <HotkeyLayer
      id="play-button"
      handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
    >
      <FocusableElement
        ref={ref}
        initialFocus
        opts={{
          focusKey: "fullscreen-play-button",
          onFocus: ({ node }) => {
            node?.focus({ preventScroll: true });
          },
        }}
      >
        <PlayGameButton onFocus={onFocus} className={buttonStyles} />
      </FocusableElement>
    </HotkeyLayer>
  );
}

function InstallButton() {
  const ref = useRef<HTMLButtonElement>(null!);

  return (
    <HotkeyLayer
      id="install-button"
      handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
    >
      <FocusableElement
        ref={ref}
        initialFocus
        opts={{
          focusKey: "fullscreen-install-button",
          onFocus: ({ node }) => {
            node?.focus({ preventScroll: true });
          },
        }}
      >
        <InstallGameButton
          onFocus={onFocus}
          className={cn(
            buttonStyles,
            '[&_div[role="progressbar"]]:w-[6ch] [&_div[role="progressbar"]_>_*]:bg-primary-foreground',
          )}
        />
      </FocusableElement>
    </HotkeyLayer>
  );
}

function DownloadButton() {
  const ref = useRef<HTMLButtonElement>(null!);
  const { game } = useGameDetail();

  return (
    <HotkeyLayer
      id="download-button"
      handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
    >
      <FocusableElement
        ref={ref}
        initialFocus
        opts={{
          focusKey: "fullscreen-download-button",
          onFocus: ({ node }) => {
            node?.focus({ preventScroll: true });
          },
        }}
      >
        <DownloadGameButton
          onFocus={onFocus}
          game={game}
          className={buttonStyles}
        />
      </FocusableElement>
    </HotkeyLayer>
  );
}
