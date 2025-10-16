import { getFileStub } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@retrom/ui/components/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@retrom/ui/components/dropdown-menu";
import { cn } from "@retrom/ui/lib/utils";
import { ComponentPropsWithoutRef, useMemo } from "react";
import { PlatformWithMetadata } from ".";
import { useGames } from "@/queries/useGames";
import { Skeleton } from "@retrom/ui/components/skeleton";
import { GameItem } from "./game-item";
import { Button } from "@retrom/ui/components/button";
import { EllipsisVertical } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useFilterAndSort } from "./filter-sort-context";
import { filterName, sortGames } from "./utils";
import { useInstallationIndex } from "@/providers/installation-index";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";

export function GameList(props: { platform: PlatformWithMetadata }) {
  const { platform } = props;

  const { gameSortKey, filters, gameSortDirection, groupByInstallationStatus } =
    useFilterAndSort();
  const { installations } = useInstallationIndex();

  const name = platform.metadata?.name || getFileStub(platform.path);

  const { data: allGames, status: gamesStatus } = useGames({
    request: { platformIds: [platform.id], withMetadata: true },
    selectFn: (data) => data.games,
  });

  const games = useMemo(() => {
    const games =
      allGames?.filter((game) => filterName(game, filters.name)) ?? [];

    games.sort((a, b) => sortGames(a, b, gameSortKey, gameSortDirection));

    if (groupByInstallationStatus) {
      games.sort((a, b) => {
        const aInstalled = installations[a.id] === InstallationStatus.INSTALLED;

        const bInstalled = installations[b.id] === InstallationStatus.INSTALLED;

        if (aInstalled && !bInstalled) {
          return -1;
        }

        if (!aInstalled && bInstalled) {
          return 1;
        }

        return 0;
      });
    }

    return games;
  }, [
    allGames,
    filters.name,
    gameSortDirection,
    gameSortKey,
    groupByInstallationStatus,
    installations,
  ]);

  if (gamesStatus === "pending") {
    return <Skeleton className="w-full h-12" />;
  }

  if (gamesStatus === "error") {
    return (
      <div className="grid place-items-center pt-4">
        <p className="font-medium text-destructive-text italic">
          Failed to load games.
        </p>
      </div>
    );
  }

  return (
    <AccordionItem
      key={platform.id}
      value={platform.id.toString()}
      className={cn("border-b-0 w-full max-w-full")}
    >
      <div
        className={cn(
          "group grid grid-cols-[1fr_auto] border-b border-transparent",
          "sm:hover:border-border transition-all",
        )}
      >
        <AccordionTrigger
          hideIcon
          className={cn(
            "group py-2 font-medium overflow-hidden relative hover:no-underline",
          )}
        >
          <div className="flex w-full">
            <h3 className="text-left text-lg sm:text-base whitespace-nowrap text-ellipsis overflow-hidden">
              {name}
            </h3>
            <span className="sr-only">Toggle</span>
          </div>
        </AccordionTrigger>

        <PlatformContextMenu platform={platform} />
      </div>

      <AccordionContent>
        {games.length ? (
          <ul>
            {games.map((game) => {
              return <GameItem key={game.id} game={game} />;
            })}
          </ul>
        ) : (
          <div className="grid place-items-center pt-4">
            <p className="font-medium text-muted-foreground italic">
              There are no games here...
            </p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function PlatformContextMenu(
  props: ComponentPropsWithoutRef<typeof DropdownMenuTrigger> & {
    platform: PlatformWithMetadata;
  },
) {
  const { platform, ...rest } = props;

  const name = platform.metadata?.name || getFileStub(platform.path);
  const { id, thirdParty } = platform;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        {...rest}
        className={cn(
          "sm:opacity-0 transition-opacity active:opacity-100",
          "sm:group-hover:opacity-100 data-[state=open]:opacity-100",
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          className="w-fit h-fit aspect-square p-2 my-auto"
        >
          <EllipsisVertical className={cn("w-[1rem] h-[1rem]")} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          "w-dvw flex flex-col items-center gap-2",
          "sm:w-auto sm:block",
        )}
      >
        <DropdownMenuItem
          asChild
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Link
            to="."
            search={(prev) => ({
              ...prev,
              updatePlatformMetadataModal: { open: true, id: platform.id },
            })}
          >
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="text-destructive-text"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Link
            to="."
            search={(prev) => ({
              ...prev,
              deletePlatformModal: {
                open: true,
                platform: { id, name, thirdParty },
              },
            })}
          >
            Delete
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
