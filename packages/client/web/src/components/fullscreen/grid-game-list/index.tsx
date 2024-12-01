import { GameWithMetadata } from "@/components/game-list";
import { InterfaceConfig_GameListEntryImage } from "@/generated/retrom/client/client-config";
import { cn, getFileStub } from "@/lib/utils";
import { useConfig } from "@/providers/config";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { FocusContainer } from "../focus-container";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useGroupContext } from "@/providers/fullscreen/group-context";

const { BACKGROUND } = InterfaceConfig_GameListEntryImage;

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
          props.kind === BACKGROUND ? "text-lg py-2 px-4" : "text-2xl p-4",
          "flex items-end font-black",
        )}
      >
        <p className="text-pretty">{gameName}</p>
      </div>
    </div>
  );
}
