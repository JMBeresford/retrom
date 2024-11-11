import { ActionButton } from "@/components/action-button";
import { ActionBar } from "@/components/fullscreen/action-bar";
import {
  FocusableElement,
  FocusContainer,
} from "@/components/fullscreen/focus-container";
import { GameActions } from "@/components/fullscreen/game-actions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getFileStub, timestampToDate } from "@/lib/utils";
import { GameDetailProvider, useGameDetail } from "@/providers/game-details";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef } from "react";

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
  const actionButton = useRef<HTMLButtonElement>(null!);
  const { gameMetadata, game, platform, platformMetadata } = useGameDetail();
  const navigate = useNavigate();

  const name = gameMetadata?.name || getFileStub(game.path);
  const playTime = useMemo(() => {
    const time = gameMetadata?.minutesPlayed;

    if (time === undefined) {
      return "Not played yet";
    }

    if (time > 60) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;

      return `${hours} hours ${minutes} minutes`;
    }

    return `${time} minutes`;
  }, [gameMetadata?.minutesPlayed]);

  const lastPlayed = useMemo(() => {
    const played = gameMetadata?.lastPlayed;

    if (!played) {
      return "Not played yet";
    }

    return timestampToDate(played).toLocaleString();
  }, [gameMetadata?.lastPlayed]);

  const addedOn = useMemo(() => {
    const timestamp = game.createdAt;

    if (!timestamp) {
      return "";
    }

    return timestampToDate(timestamp).toLocaleString();
  }, [game.createdAt]);

  const platformName = useMemo(() => {
    if (typeof platformMetadata?.name === "string") {
      return platformMetadata.name;
    }

    return getFileStub(platform.path) ?? "Unknown";
  }, [platformMetadata, platform.path]);

  return (
    <HotkeyLayer
      id="game-page"
      handlers={{
        BACK: {
          handler: () => navigate({ to: "/fullscreen", resetScroll: false }),
        },
      }}
    >
      <FocusContainer
        opts={{ focusKey: "game-details", forceFocus: true }}
        className="flex-grow flex justify-center items-center w-full animate-in fade-in"
      >
        <div
          className={cn(
            "flex w-[70dvw] rounded-lg h-[80%] relative overflow-hidden",
            "shadow-2xl shadow-card/80",
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-8 p-8 justify-end",
              "bg-card/80 border-r border-border",
            )}
          >
            <InfoItem title="Play Time" value={playTime} />
            <InfoItem title="Last Played" value={lastPlayed} />
            <InfoItem title="Added On" value={addedOn} />
            <InfoItem title="Platform" value={platformName} />

            <div className="grid grid-flow-row grid-rows-[1fr,1fr] gap-2">
              <HotkeyLayer
                handlers={{
                  ACCEPT: {
                    handler: () => actionButton.current.click(),
                  },
                }}
              >
                <ActionButton
                  ref={actionButton}
                  game={game}
                  size="lg"
                  autoFocus
                  className={cn(
                    "uppercase rounded",
                    '[&_div[role="progressbar"]]:w-[85%] [&_div[role="progressbar"]_>_*]:bg-primary-foreground',
                    "opacity-80 focus-hover:opacity-100 transition-all",
                  )}
                />
              </HotkeyLayer>

              <HotkeyLayer
                handlers={{
                  ACCEPT: {
                    handler: (event) => {
                      navigate({ to: "/fullscreen", resetScroll: false });
                      event?.preventDefault();
                      event?.stopPropagation();
                    },
                  },
                }}
              >
                <FocusableElement
                  opts={{
                    focusKey: "back-button",
                  }}
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className={cn(
                      "font-bold text-lg tracking-wider uppercase",
                      "opacity-80 focus-hover:opacity-100 transition-all",
                    )}
                    onClick={() =>
                      navigate({ to: "/fullscreen", resetScroll: false })
                    }
                  >
                    Back
                  </Button>
                </FocusableElement>
              </HotkeyLayer>
            </div>
          </div>

          <div className="relative max-h-full h-full flex flex-col justify-end w-full p-8">
            <div className="absolute inset-0 -z-[1]">
              {gameMetadata?.backgroundUrl && (
                <img
                  src={gameMetadata?.backgroundUrl}
                  className="object-cover min-h-full min-w-full"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="relative max-h-[60%] flex flex-col w-full justify-stretch">
              <h1
                className={cn(
                  "font-black uppercase mb-4",
                  name.length > 20 ? "text-5xl" : "text-7xl",
                )}
              >
                {name}
              </h1>

              <Description
                description={
                  gameMetadata?.description ||
                  "No description found, have you downloaded metadata for this game?"
                }
              />
            </div>
          </div>
        </div>
      </FocusContainer>

      <ActionBar>
        <div className="flex w-full">
          <GameActions />
        </div>
      </ActionBar>
    </HotkeyLayer>
  );
}

function Description(props: { description: string }) {
  const { description } = props;
  const { ref, focused } = useFocusable<HTMLDivElement>({
    focusKey: "game-description",
    onFocus: ({ node }) => {
      if (node !== document.activeElement) {
        node?.focus();
      }
    },
    onBlur: ({ node }) => {
      if (node === document.activeElement) {
        node?.blur();
      }
    },
  });

  return (
    <HotkeyLayer
      id="game-description"
      handlers={{
        UP: {
          handler: (event) => {
            console.log(event);
            ref.current?.scrollBy({ top: -100, behavior: "smooth" });
            event?.stopPropagation();
            event?.preventDefault();
          },
        },
        DOWN: {
          handler: (event) => {
            console.log(event);
            ref.current?.scrollBy({ top: 100, behavior: "smooth" });
            event?.stopPropagation();
            event?.preventDefault();
          },
        },
      }}
    >
      <ScrollArea
        ref={ref}
        tabIndex={-1}
        type={focused ? "auto" : "hover"}
        className={cn(
          "w-full px-4 py-2 rounded-r border-l-4 border-accent",
          "bg-transparent hover:bg-muted/80 hover:border-y hover:border-r transition-colors",
          "[&_*]:outline-none",
          focused && "bg-muted/80",
        )}
      >
        <div>
          <h3 className="text-lg text-muted-foreground max-w-[75ch]">
            {description}
          </h3>
        </div>
      </ScrollArea>
    </HotkeyLayer>
  );
}

function InfoItem(props: { title: string; value: string }) {
  return (
    <div className="whitespace-nowrap">
      <h3 className="text-2xl font-bold uppercase">{props.title}</h3>
      <p className="text-muted-foreground">{props.value}</p>
    </div>
  );
}
