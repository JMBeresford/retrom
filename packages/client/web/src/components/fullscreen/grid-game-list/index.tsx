import { GameWithMetadata } from "@/components/game-list";
import { InterfaceConfig_GameListEntryImage } from "@/generated/retrom/client/client-config";
import { cn, getFileStub } from "@/lib/utils";
import { useConfig } from "@/providers/config";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { FocusContainer } from "../focus-container";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useGroupContext } from "@/providers/fullscreen/group-context";

const { COVER } = InterfaceConfig_GameListEntryImage;

export function GridGameList(props: { games?: GameWithMetadata[] }) {
  const { games } = props;
  const { activeGroup } = useGroupContext();
  const { columns, gap } = useConfig(
    (s) => s.config.interface.fullscreenConfig.gridList,
  );

  const getDelay = useCallback(
    (idx: number) => {
      const col = idx % columns;
      const row = Math.floor(idx / columns);

      const distFromFirst = 1 + Math.sqrt(col * col + row * row);

      return distFromFirst * 150;
    },
    [columns],
  );

  return (
    <FocusContainer
      initialFocus
      opts={{ focusKey: "game-list", forceFocus: true }}
      style={{ "--game-cols": columns, "--game-gap": `${gap}px` }}
      className={cn(
        "w-[70%] mx-auto py-[30dvh]",
        "grid gap-[var(--game-gap)] grid-cols-[repeat(var(--game-cols),minmax(0,1fr))]",
      )}
    >
      {games?.map((game, idx) => (
        <div
          key={game.id}
          style={{
            animationDelay: `${getDelay(idx)}ms`,
          }}
          className="animate-in fade-in fill-mode-both duration-500"
        >
          <GameListItem
            game={game}
            id={`game-list-${activeGroup?.id}-${idx}`}
          />
        </div>
      ))}
    </FocusContainer>
  );
}

function GameListItem(props: { game: GameWithMetadata; id: string }) {
  const { game, id } = props;
  const navigate = useNavigate();
  const { ref, focusSelf } = useFocusable<HTMLAnchorElement>({
    focusKey: id,
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
    (s) => s.config.interface.fullscreenConfig.gridList,
  );

  useEffect(() => {
    if (id.endsWith("-0")) focusSelf();
  }, [focusSelf, id]);

  return (
    <div
      className={cn(
        "group scale-95 focus-within:scale-100 hover:scale-100 transition-all",
        "shadow-lg shadow-background relative cursor-pointer",
        "ring-ring focus-within:ring-4 rounded h-full w-full",
        // focused && "ring-4 scale-100",
      )}
    >
      <HotkeyLayer
        handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
      >
        <div
          tabIndex={-1}
          id={id}
          ref={ref}
          className="border-none outline-none"
          onClick={() =>
            navigate({
              to: "/fullscreen/games/$gameId",
              params: { gameId: game.id.toString() },
            })
          }
        >
          {imageType === COVER ? (
            <CoverImage game={game} />
          ) : (
            <BackgroundImage game={game} />
          )}
        </div>
      </HotkeyLayer>
    </div>
  );
}

function CoverImage(props: { game: GameWithMetadata }) {
  const { game } = props;

  return (
    <div
      key={game.id}
      className="aspect-[3/4] rounded overflow-hidden relative outline-none"
    >
      {game.metadata?.coverUrl ? (
        <img
          loading="lazy"
          src={game.metadata.coverUrl}
          className="object-cover w-full"
        />
      ) : (
        <div className="w-full h-full border"></div>
      )}
    </div>
  );
}

function BackgroundImage(props: { game: GameWithMetadata }) {
  const { game } = props;

  const gameName = game.metadata?.name ?? getFileStub(game.path);

  return (
    <div
      key={game.id}
      className={cn(
        "aspect-video rounded overflow-hidden relative",
        game.metadata?.backgroundUrl ? "h-fit w-fit" : "h-full w-full",
      )}
    >
      {game.metadata?.backgroundUrl ? (
        <img
          loading="lazy"
          src={game.metadata.backgroundUrl}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-secondary/50 grid place-items-center text-center text-lg font-black">
          {gameName}
        </div>
      )}
    </div>
  );
}
