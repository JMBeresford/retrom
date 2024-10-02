import { useGroupContext } from "@/providers/fullscreen/group-context";
import { GridGameList } from "@/components/fullscreen/grid-game-list";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { GroupMenu } from "@/components/fullscreen/group-menu";
import { ActionBar } from "@/components/fullscreen/action-bar";
import { Fragment } from "react/jsx-runtime";

export const Route = createLazyFileRoute("/_fullscreenLayout/fullscreen/")({
  component: FullscreenComponent,
});

function FullscreenComponent() {
  const { activeGroup, allGroups } = useGroupContext();

  return (
    <>
      <ScrollArea className="h-full">
        <div className="relative">
          {allGroups.map((group) =>
            activeGroup?.id === group.id ? (
              <GridGameList key={group.id} games={group.games} />
            ) : (
              <Fragment key={group.id} />
            ),
          )}
        </div>

        <Scrollbar orientation="vertical" className="z-[100]" />
      </ScrollArea>

      <ActionBar className="overflow-hidden max-w-screen">
        <GroupMenu className="w-full" />
      </ActionBar>
    </>
  );
}
