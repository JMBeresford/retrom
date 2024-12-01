import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { usePlatforms } from "@/queries/usePlatforms";
import { getFileStub, timestampToDate } from "@/lib/utils";
import { useGames } from "@/queries/useGames";
import { GameWithMetadata } from "@/components/game-list";
import { Route } from "@/routes/_fullscreenLayout";

export type GroupKind = "platform" | "metadataProperty" | (string & {});

export type Group = {
  kind: GroupKind;
  id: number;
  name: string;
  games?: GameWithMetadata[];
};

type GroupContext = {
  allGroups: Group[];
  activeGroup?: Group;
  previousGroup?: Group;
  nextGroup?: Group;
};

const context = createContext<GroupContext | undefined>(undefined);

export function GroupContextProvider(props: PropsWithChildren) {
  const { activeGroupId } = Route.useSearch();

  const { data: platforms } = usePlatforms({
    request: { withMetadata: true },
    selectFn: (data) =>
      data.platforms.map((platform) => {
        const metadata = data.metadata.find(
          (metadata) => metadata.platformId === platform.id,
        );

        return {
          ...platform,
          metadata,
        };
      }),
  });

  const { data: games } = useGames({
    request: { withMetadata: true },
    selectFn: (data) =>
      data.games.map((game) => {
        const metadata = data.metadata.find(
          (metadata) => metadata.gameId === game.id,
        );

        return {
          ...game,
          metadata,
        };
      }),
  });

  const allGames: Group = useMemo(
    () => ({
      kind: "metadataProperty",
      id: -1,
      name: "All Games",
      games: games?.slice(0, 50),
    }),
    [games],
  );

  const recentlyPlayed: Group = useMemo(
    () => ({
      kind: "metadataProperty",
      id: -2,
      name: "Recently Played",
      games: games
        ?.sort((a, b) => {
          const aLastPlayed = timestampToDate(a.metadata?.lastPlayed).getTime();
          const bLastPlayed = timestampToDate(b.metadata?.lastPlayed).getTime();

          return bLastPlayed - aLastPlayed;
        })
        .slice(0, 50),
    }),
    [games],
  );

  const platformGroups: Group[] = useMemo(
    () =>
      platforms
        ?.map((platform) => ({
          kind: "platform",
          id: platform.id,
          name: platform.metadata?.name ?? getFileStub(platform.path),
          url: "/fullscreen/platforms/$platformId",
          params: { platformId: platform.id.toString() },
          games: games?.filter((game) => game.platformId === platform.id),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)) ?? [],
    [platforms, games],
  );

  const allGroups: Group[] = useMemo(() => {
    return [allGames, recentlyPlayed]
      .concat(platformGroups)
      .filter((group) => group.games?.length);
  }, [allGames, recentlyPlayed, platformGroups]);

  const { activeGroup, nextGroup, previousGroup } = useMemo(() => {
    const activeGroupIdx = allGroups.findIndex(
      (group) => group.id === activeGroupId,
    );

    if (activeGroupIdx === -1) {
      return {};
    }

    function getNext(idx: number) {
      const nextIdx = (idx + 1) % allGroups.length;

      return allGroups.at(nextIdx);
    }

    function getPrev(idx: number) {
      const prevIdx = idx - 1;

      return allGroups.at(prevIdx);
    }

    const activeGroup = allGroups.at(activeGroupIdx);
    const previousGroup = getPrev(activeGroupIdx);
    const nextGroup = getNext(activeGroupIdx);

    return { activeGroup, previousGroup, nextGroup };
  }, [allGroups, activeGroupId]);

  return (
    <context.Provider
      value={{ activeGroup, previousGroup, nextGroup, allGroups }}
      {...props}
    />
  );
}

export function useGroupContext() {
  const ctx = useContext(context);

  if (ctx === undefined) {
    throw new Error(
      "useGroupContext must be used within a GroupContextProvider",
    );
  }

  return ctx;
}
