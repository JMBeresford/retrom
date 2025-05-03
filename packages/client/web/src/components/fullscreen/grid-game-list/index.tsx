import { GameWithMetadata } from "@/components/game-list";
import { InterfaceConfig_GameListEntryImage } from "@retrom/codegen/retrom/client/client-config";
import { cn, getFileStub } from "@/lib/utils";
import { useConfig } from "@/providers/config";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { FocusContainer, useFocusable } from "../focus-container";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useGroupContext } from "@/providers/fullscreen/group-context";
import { Separator } from "@/components/ui/separator";

const { BACKGROUND, COVER } = InterfaceConfig_GameListEntryImage;

export function GridGameList() {
  const { activeGroup, allGroups } = useGroupContext();

  const { columns, gap } = useConfig(
    (s) => s.config?.interface?.fullscreenConfig?.gridList,
  ) ?? { columns: 4, gap: 20 };

  const getDelay = useCallback(
    (idx: number) => {
      const col = idx % columns;

      return col * 150;
    },
    [columns],
  );

  return allGroups.map((group) =>
    group.id === activeGroup?.id ? (
      <FocusContainer
        opts={{
          focusKey: `game-list-${group.id}`,
          saveLastFocusedChild: false,
          initialFocus: true,
        }}
        style={{ "--game-cols": columns, "--game-gap": `${gap}px` }}
        className={cn("flex flex-col gap-4 w-full mx-auto py-[20dvh] px-4")}
      >
        {group.allGames.length === 0 && (
          <div className="flex flex-col gap-4 items-center justify-center">
            <h2 className="text-foreground/80 font-black text-2xl">
              No games found 😔
            </h2>
            <p className="text-foreground/50">
              Please add some games to your library.
            </p>
          </div>
        )}
        {activeGroup?.partitionedGames
          ?.filter(([_, games]) => !!games.length)
          .map(([key, games]) => (
            <FocusContainer
              opts={{
                focusKey: `game-list-${activeGroup.id}-${key}-container`,
                focusable: !!games.length,
                saveLastFocusedChild: false,
              }}
              key={key}
              className={cn(!games.length ? "hidden" : "block")}
            >
              <div
                className={cn(
                  "grid gap-4 place-items-center mb-4 px-4",
                  "grid-cols-[1fr,auto,1fr]",
                )}
              >
                <Separator className="bg-foreground/30" />

                <h3
                  id={`game-list-header-${key}`}
                  className="uppercase font-black text-xl text-foreground/80 scroll-mt-16"
                >
                  {key}
                </h3>

                <Separator className="bg-foreground/30" />
              </div>

              <div
                className={cn(
                  "grid w-full gap-[var(--game-gap)]",
                  "grid-cols-[repeat(var(--game-cols),minmax(0,1fr))]",
                )}
              >
                {games.map((game) => (
                  <div
                    key={game.id}
                    style={{
                      animationDelay: `${getDelay(group.allGames.findIndex(({ id }) => id === game.id))}ms`,
                    }}
                    className={cn(
                      "animate-in fade-in fill-mode-both duration-500",
                    )}
                  >
                    <GameListItem
                      game={game}
                      id={`game-list-${activeGroup.id}-${game.id}`}
                    />
                  </div>
                ))}
              </div>
            </FocusContainer>
          ))}
      </FocusContainer>
    ) : null,
  );
}

function GameListItem(props: { game: GameWithMetadata; id: string }) {
  const { game, id } = props;
  const navigate = useNavigate();
  const { ref } = useFocusable<HTMLDivElement>({
    focusKey: id,
    forceFocus: true,
    onFocus: ({ node }) => {
      node?.focus({ preventScroll: true });
      node?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    },
  });

  const { imageType } = useConfig(
    (s) => s.config?.interface?.fullscreenConfig?.gridList,
  ) ?? { imageType: COVER };

  return (
    <div
      className={cn(
        "group scale-95 focus-within:scale-100 hover:scale-100 transition-all",
        "shadow-lg shadow-background relative cursor-pointer",
        "rounded h-full w-full",
      )}
    >
      <HotkeyLayer
        handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
      >
        <div
          tabIndex={-1}
          id={id}
          ref={ref}
          className={cn("border-none outline-none")}
          onClick={() =>
            void navigate({
              to: "/fullscreen/games/$gameId",
              params: { gameId: game.id.toString() },
            })
          }
        >
          <GameImage game={game} kind={imageType} />
        </div>
      </HotkeyLayer>
    </div>
  );
}

function GameImage(props: {
  game: GameWithMetadata;
  kind: InterfaceConfig_GameListEntryImage;
}) {
  const { game } = props;
  const imageSrc =
    props.kind === BACKGROUND
      ? game.metadata?.backgroundUrl
      : game.metadata?.coverUrl;

  const [noImage, setNoImage] = useState(!imageSrc);

  const gameName = game.metadata?.name ?? getFileStub(game.path);

  return (
    <div
      key={game.id}
      className={cn(
        props.kind === BACKGROUND ? "aspect-video" : "aspect-[3/4]",
        "rounded overflow-hidden relative",
        "h-fit w-fit min-w-full min-h-full",
      )}
    >
      {imageSrc && (
        <img
          loading="lazy"
          src={imageSrc}
          onError={() => {
            setNoImage(true);
          }}
          className={cn(
            "absolute object-cover min-w-full min-h-full",
            noImage && "hidden",
          )}
        />
      )}

      <div
        className={cn(
          !noImage && "opacity-0 translate-y-2 transition-all",
          "group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0",
          "absolute inset-0",
          "bg-gradient-to-t from-card",
          "ring-ring ring-inset group-focus-within:ring-4",
          props.kind === BACKGROUND ? "text-lg py-2 px-4" : "text-2xl p-4",
          "flex items-end font-black",
        )}
      >
        <p className="text-pretty">{gameName}</p>
      </div>
    </div>
  );
}
